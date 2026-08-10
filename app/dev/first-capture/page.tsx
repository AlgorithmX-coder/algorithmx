/* Dev harness for the playable First Capture vertical slice. /dev/* is 404 in
 * production (middleware); this is where we iterate on the capture loop before
 * it graduates into the real Cyber Ops lesson chassis. */
import FirstCapture from "@/app/operators/range/FirstCapture";

export default function FirstCaptureDevPage() {
  return <FirstCapture />;
}
