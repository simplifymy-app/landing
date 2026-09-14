export const BUILDS = {
  "win:x64:setup": "SimplifyMyShot-win-x64-Setup.exe",
  "win:x64:msi": "SimplifyMyShot-win-x64.msi",
  "win:x64:portable": "SimplifyMyShot-win-x64-Portable.zip",
  "win:arm64:setup": "SimplifyMyShot-win-arm64-Setup.exe",
  "win:arm64:msi": "SimplifyMyShot-win-arm64.msi",
  "win:arm64:portable": "SimplifyMyShot-win-arm64-Portable.zip",
  "osx:x64:setup": "SimplifyMyShot-osx-x64-Setup.pkg",
  "osx:x64:portable": "SimplifyMyShot-osx-x64-Portable.zip",
  "osx:arm64:setup": "SimplifyMyShot-osx-arm64-Setup.pkg",
  "osx:arm64:portable": "SimplifyMyShot-osx-arm64-Portable.zip",
};

export const PLATFORMS = ["win", "osx"];
export const ARCHES = ["x64", "arm64"];
export const KINDS = ["setup", "msi", "portable"];

export const filenameFor = (platform, arch, kind) =>
  BUILDS[`${platform}:${arch}:${kind}`] ?? null;
