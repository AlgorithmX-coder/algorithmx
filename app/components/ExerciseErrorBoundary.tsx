"use client";

import React from "react";

interface Props {
  children: React.ReactNode;
  /** Called when the user clicks "Skip this exercise". */
  onSkip?: () => void;
}

interface State {
  error: Error | null;
}

/**
 * Catches any throw inside the lesson screen tree so a bad exercise doesn't
 * white-screen the whole lesson. Logs the error to the console with the
 * component stack so we can debug from a user report.
 */
export default class ExerciseErrorBoundary extends React.Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    // eslint-disable-next-line no-console
    console.error("[ExerciseErrorBoundary]", error, info.componentStack);
  }

  private reset = () => {
    this.setState({ error: null });
    this.props.onSkip?.();
  };

  render() {
    if (!this.state.error) return this.props.children;

    return (
      <div
        role="alert"
        style={{
          minHeight: 420,
          margin: "0 auto",
          maxWidth: 560,
          padding: 32,
          borderRadius: 20,
          textAlign: "center",
          color: "#e2e8f0",
          background:
            "radial-gradient(ellipse at center, rgba(239,68,68,0.15), transparent 70%), linear-gradient(180deg, #1a0505 0%, #0a0a1a 100%)",
          border: "1px solid rgba(239,68,68,0.35)",
          boxShadow: "0 0 24px rgba(239,68,68,0.2)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div style={{ fontSize: 56, marginBottom: 12 }}>🛠️</div>
        <h2
          style={{
            fontSize: 24,
            fontWeight: 900,
            color: "#fca5a5",
            marginBottom: 8,
          }}
        >
          Something broke on this screen.
        </h2>
        <p style={{ color: "#cbd5e1", fontSize: 15, marginBottom: 20 }}>
          Don&apos;t worry - your progress is safe. You can skip this exercise
          and keep going, or refresh to try it again.
        </p>
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap", justifyContent: "center" }}>
          <button
            type="button"
            onClick={this.reset}
            style={{
              background: "linear-gradient(135deg, #f97316, #f59e0b)",
              color: "#fff",
              fontWeight: 800,
              borderRadius: 12,
              padding: "12px 28px",
              fontSize: 15,
              border: "none",
              cursor: "pointer",
              boxShadow: "0 0 14px rgba(249,115,22,0.45)",
            }}
          >
            Skip this exercise &rarr;
          </button>
          <button
            type="button"
            onClick={() => {
              if (typeof window !== "undefined") window.location.reload();
            }}
            style={{
              background: "transparent",
              color: "#93c5fd",
              fontWeight: 700,
              borderRadius: 12,
              padding: "10px 22px",
              fontSize: 14,
              border: "2px solid rgba(96,165,250,0.55)",
              cursor: "pointer",
            }}
          >
            🔄 Refresh
          </button>
        </div>
        {process.env.NODE_ENV !== "production" && (
          <pre
            style={{
              marginTop: 20,
              textAlign: "left",
              fontSize: 11,
              color: "#94a3b8",
              maxWidth: "100%",
              overflow: "auto",
              background: "rgba(0,0,0,0.3)",
              padding: 10,
              borderRadius: 8,
              maxHeight: 120,
            }}
          >
            {this.state.error.message}
          </pre>
        )}
      </div>
    );
  }
}
