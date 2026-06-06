# AlgorithmX Auth Reactor — GLB Asset Specification

This document specifies the production GLB model for the signup/login centrepiece
("Auth Reactor"). It is the contract a 3D artist (Blender) delivers against so the
model drops into `components/auth-reactor/` with no signup-page changes.

The attached concept render is **visual reference only** — it is not a model. A
plugin cannot convert it into a production articulated GLB; the model must be built.

---

## 1. Node hierarchy (names are load-bearing — the controller binds to them)

```
AX_Reactor_Root
├─ AX_OuterFrame          // static machined bezel/housing
├─ AX_Backplate           // closes the rear so the open core never shows the page
├─ AX_CoreHousing         // static inner collar the panels seat into
│
├─ AX_Hinge_01 … _06      // pivot empties at each panel's hinge (see §3)
│   └─ AX_Panel_01 … _06  // the six armour panels (children of their hinge)
│
├─ AX_Clamp_01 … _06      // mechanical locks that retract before a panel opens
│
├─ AX_Ring_Outer          // three concentric rings, independent Z spin
├─ AX_Ring_Middle
├─ AX_Ring_Inner
│
├─ AX_CoreCrystal         // faceted crystal (emissive-capable)
├─ AX_CoreGlass           // smoked-glass shell around the crystal
├─ AX_CoreEmitter         // small bright emitter (drives bloom)
│
├─ AX_EnergyPath_01 … _06 // emissive channels rim → core, lit in sequence
└─ AX_StatusLight_01 … _06// six small emissive status pips
```

Keep these **exact** names (case-sensitive). The controller maps `AX_Panel_0N`,
`AX_Hinge_0N`, `AX_Clamp_0N`, `AX_EnergyPath_0N`, `AX_StatusLight_0N` by index
`N = 1..6` to the six form-driven stream channels.

---

## 2. Transforms & origins

- **Apply all transforms** (location/rotation/scale) before export, EXCEPT the
  deliberate hinge pivots.
- Each `AX_Hinge_0N` empty sits **exactly on the panel's physical hinge axis**, so
  rotating the hinge swings the panel like a real door (no drift, no scaling).
- `AX_Panel_0N` is parented to `AX_Hinge_0N` with the panel's own origin centred on
  its mass.
- Rings' origins at world centre (0,0,0) so they spin cleanly on local Z.
- Crystal/glass/emitter origins at the reactor centre.
- **Up axis +Y, forward −Z**, real-world scale: overall diameter ≈ **2.6 m**
  (so it reads at `scale ≈ 1` in the scene; the controller will fit-scale anyway).

---

## 3. Articulation (what each part must be able to do)

| Part | Motion | Range |
|------|--------|-------|
| `AX_Hinge_0N` | rotate on local X (or hinge axis) | closed → open ≈ 35–55° |
| `AX_Clamp_0N` | slide/retract on local Z | seated → retracted ≈ 4–8 cm |
| `AX_Ring_*` | spin on local Z | continuous, independent speeds |
| `AX_CoreCrystal` | scale + emissive pulse | 0.9–1.3× |
| `AX_CoreEmitter` | emissive intensity | dormant → full |

Pivots must be correct in **rest pose = fully closed (Stage 0)**.

---

## 4. Materials (PBR metallic-roughness only)

- **Separate materials** for anything independently illuminated:
  `AX_EnergyPath_0N`, `AX_StatusLight_0N`, `AX_CoreCrystal`, `AX_CoreEmitter`,
  and the panel accent strips — each its own material with an **emissive** slot.
- Body: dark anodised gunmetal — `baseColor ≈ #15131f`, metalness 1, roughness 0.30–0.45.
- Trim: warm brass/bronze — `baseColor ≈ #c9a25e`, metalness 1, roughness 0.25–0.35.
- Glass: `AX_CoreGlass` — low roughness, `transmission` optional (see perf note), thin.
- Emissive meshes use a near-black baseColor + bright emissive so the controller can
  drive `emissiveIntensity` from 0 (dormant) to full without changing albedo.
- **No procedural/shader-node Blender materials** (Principled BSDF + image/spec
  textures only — they will not survive glTF export). Bake any procedural detail.
- Clean, non-overlapping UVs; one UV set. No duplicated internal faces. No n-gons in
  shaded areas (triangulate on export).

---

## 5. Budgets (per tier)

| Tier | Triangles | Textures | Notes |
|------|-----------|----------|-------|
| Desktop (high) | ≤ 180k | up to 2048², 4–6 maps | full detail |
| Tablet (medium) | ≤ 110k | 1024² | drop micro-bevels |
| Mobile (low) | ≤ 55k | 512², merged maps | simplified panels, fewer ring teeth |

Prefer **one merged texture atlas** per material-group. Use KTX2/Basis where
possible (gltf-transform can generate). Avoid >2k textures entirely.

Optional: ship a single source GLB + let the pipeline (below) emit tiered variants,
or author an explicit low-poly `AX_Reactor_LOD2`.

---

## 6. Animation clips (optional, names matter if present)

Author clips ONLY where procedural control is awkward:
- `AX_Idle` — subtle breathing/settle loop (the controller may use this or do it in-engine).
- `AX_SuccessBurst` — the one-shot Stage-7 hero beat.

The per-stage panel/ring/clamp choreography is driven **procedurally by the
controller** from the named nodes — clips are not required for it. Keep object names
preserved on export (glTF "names").

---

## 7. Export settings (Blender → glTF 2.0 .glb)

- Format: **glTF Binary (.glb)**, +Y up, include: Selected Objects (the rig), Custom
  Properties off, Cameras/Lights **off** (the app lights it).
- Apply Modifiers: on. Tangents: on (if normal maps). Compression: leave OFF at
  export — the pipeline applies Draco/Meshopt deterministically.
- One root (`AX_Reactor_Root`). No stray empties/cameras/lights.

---

## 8. Pipeline (process the delivered source — never overwrite it)

Keep three artefacts:
```
assets/auth-reactor/source/auth-reactor.glb        # artist delivery (never edited)
assets/auth-reactor/work/auth-reactor.work.glb     # intermediate
public/auth-reactor/auth-reactor.opt.glb           # web-ready, shipped
```

Verify flags before running (versions: `@gltf-transform/cli` 4.4.0, `gltfjsx` 6.5.3):
```bash
# 1. Inspect (tris, materials, textures, extensions)
npx @gltf-transform/cli inspect assets/auth-reactor/source/auth-reactor.glb

# 2. Optimise: dedupe, weld, prune, Draco/Meshopt + WebP textures
npx @gltf-transform/cli optimize \
  assets/auth-reactor/source/auth-reactor.glb \
  public/auth-reactor/auth-reactor.opt.glb \
  --texture-compress webp

# 3. Generate the typed R3F component (preserves node names → typed refs)
npx gltfjsx@latest public/auth-reactor/auth-reactor.opt.glb \
  --types --transform --keepnames -o app/components/auth-reactor/AuthReactorModel.gen.tsx
```
> `--keepnames` preserves `AX_*` names so the controller can bind to them.
> Run `npx @gltf-transform/cli --help` / `optimize --help` to confirm flags on 4.4.0.

---

## 9. Licensing

Document the model's licence in `assets/auth-reactor/source/LICENSE.md`
(author, licence type, commercial-use terms). Do **not** commit unlicensed or
unclear-licence commercial assets. No remote-CDN model loading in production —
the optimised GLB ships from `public/`.

---

## 10. Acceptance checklist (model is "ready" when)

- [ ] All `AX_*` nodes present with exact names
- [ ] Hinge pivots correct; panels swing without drift; rest pose = closed
- [ ] Clamps retract on local axis
- [ ] Emissive meshes separated with their own materials
- [ ] Transforms applied (except hinge pivots); +Y up; ~2.6 m diameter
- [ ] PBR metallic-roughness only; clean single-set UVs; no n-gons/dupe faces
- [ ] Within the desktop tri/texture budget
- [ ] `inspect` shows no errors; `optimize` produces a < ~6 MB web GLB
- [ ] Licence documented
