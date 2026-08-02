import type { UsbDevice } from "./types";

export function evaluateUsbTarget(device: UsbDevice) {
  const reasons: string[] = [];
  if (device.systemDisk) reasons.push("Systemlaufwerk");
  if (!device.removable) reasons.push("Nicht als Wechseldatenträger erkannt");
  if (!device.serial) reasons.push("Seriennummer fehlt");
  return { allowed: reasons.length === 0, reasons, confirmation: `LÖSCHEN ${device.model.toUpperCase()}` };
}
