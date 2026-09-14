import type { ImageMetadata } from 'astro';
import type { AppSlug } from 'consts';

import galleryFolders from 'assets/gallery-folders.png';
import galleryFoldersLight from 'assets/gallery-folders-light.png';
import galleryGrid from 'assets/gallery-grid.png';
import galleryGridLight from 'assets/gallery-grid-light.png';
import galleryEdit from 'assets/gallery-edit.png';
import galleryEditLight from 'assets/gallery-edit-light.png';
import galleryMakeItYours from 'assets/gallery-make-it-yours.png';
import galleryMakeItYoursLight from 'assets/gallery-make-it-yours-light.png';

import playerLibrary from 'assets/player-library.png';
import playerLibraryLight from 'assets/player-library-light.png';
import playerAlbums from 'assets/player-albums.png';
import playerAlbumsLight from 'assets/player-albums-light.png';
import playerNowPlaying from 'assets/player-now-playing.png';
import playerNowPlayingLight from 'assets/player-now-playing-light.png';
import playerMakeItYours from 'assets/player-make-it-yours.png';
import playerMakeItYoursLight from 'assets/player-make-it-yours-light.png';

import recorderLibrary from 'assets/recorder-library.png';
import recorderLibraryLight from 'assets/recorder-library-light.png';
import recorderProject from 'assets/recorder-project.png';
import recorderProjectLight from 'assets/recorder-project-light.png';
import recorderEditor from 'assets/recorder-editor.png';
import recorderEditorLight from 'assets/recorder-editor-light.png';
import recorderSettings from 'assets/recorder-settings.png';
import recorderSettingsLight from 'assets/recorder-settings-light.png';

import filesRoot from 'assets/files-root.png';
import filesRootLight from 'assets/files-root-light.png';
import filesFolder from 'assets/files-folder.png';
import filesFolderLight from 'assets/files-folder-light.png';
import filesMarked from 'assets/files-marked.png';
import filesMarkedLight from 'assets/files-marked-light.png';
import filesSettings from 'assets/files-settings.png';
import filesSettingsLight from 'assets/files-settings-light.png';

import shotEditor from 'assets/shot-editor.png';
import shotEditorLight from 'assets/shot-editor-light.png';
import shotCapture from 'assets/shot-capture.png';
import shotCaptureLight from 'assets/shot-capture-light.png';
import shotBackdrop from 'assets/shot-backdrop.png';
import shotBackdropLight from 'assets/shot-backdrop-light.png';
import shotSettings from 'assets/shot-settings.png';
import shotSettingsLight from 'assets/shot-settings-light.png';

export type Mini = 'grid' | 'eq' | 'wave' | 'panes' | 'marquee' | 'arrow' | 'read' | 'pin';

export interface Shot {
  dark: ImageMetadata;
  light: ImageMetadata;
  alt: string;
}

export interface Highlight {
  mini: Mini;
  title: string;
  body: string;
  tint: [string, string];
}

export interface AppContent {
  tint: [string, string];
  mini: Mini;
  meta: string;
  headline: string;
  lede: string;
  body: string[];
  features: string[];
  shots: Shot[];
  caption?: string;
  highlights?: Highlight[];
  ask: [string, string];
}

export const APP_CONTENT: Record<AppSlug, AppContent> = {
  gallery: {
    tint: ['#718CFF', '#5A70CC'],
    mini: 'grid',
    meta: 'Photos & video · Android · under 5 MB',
    headline: 'Your photos, in the folders they already live in.',
    lede: 'A photo and video album that reads the pictures already on your phone, lays them out in the real folders they live in, and gets out of the way.',
    body: [
      'The part most gallery apps cannot claim: it does not request the internet permission at all, so it cannot upload a photo, load an ad or phone home — not by promise, by construction. Check the permission list before you trust me.',
    ],
    features: [
      'Folder view that mirrors your phone',
      'Group by day or month, five sort keys',
      'Full-screen viewer, pinch zoom, video',
      'Details: size, dimensions, camera, EXIF',
      'Favourites, multi-select, hide folders',
      'Light, dark and pure black themes',
      'Five accents, custom colour, six app icons',
      '2–5 columns, radius, text size, contrast',
    ],
    shots: [
      { dark: galleryFolders, light: galleryFoldersLight, alt: 'Gallery for Android showing photo folders as they exist on the phone' },
      { dark: galleryGrid, light: galleryGridLight, alt: 'Gallery for Android showing one folder grouped by day' },
      { dark: galleryEdit, light: galleryEditLight, alt: 'Gallery for Android crop and rotate editor' },
      { dark: galleryMakeItYours, light: galleryMakeItYoursLight, alt: 'Gallery for Android theme, accent and layout settings' },
    ],
    ask: [
      'Gallery is out, and it is still being worked on.',
      'Tell me what is missing and it goes into the next release.',
    ],
  },

  player: {
    tint: ['#AD8DFF', '#8A70CC'],
    mini: 'eq',
    meta: 'Music · Android · under 5 MB',
    headline: 'The music already on your phone, playing.',
    lede: 'A music player for the files you already have, read where they sit.',
    body: [
      'It plays them in the background with a real notification, lock-screen controls and headset keys, and stops there — no catalogue to browse, no account, no recommendations.',
      'Like Gallery, it does not request the internet permission, so the music cannot go anywhere.',
    ],
    features: [
      'Tracks, albums, artists and playlists',
      'Background playback, lock screen, headset keys',
      'Queue: play next, add, reorder, shuffle',
      'Swipe the cover to change track, down to close',
      'Favourites, playlists, optional play history',
      'Sleep timer and synced .lrc lyrics',
      'Hide folders you do not want in the library',
      'Same themes, accents and app icons',
    ],
    shots: [
      { dark: playerLibrary, light: playerLibraryLight, alt: 'Player for Android showing the music library read from the phone' },
      { dark: playerAlbums, light: playerAlbumsLight, alt: 'Player for Android album view' },
      { dark: playerNowPlaying, light: playerNowPlayingLight, alt: 'Player for Android now playing screen with playback controls' },
      { dark: playerMakeItYours, light: playerMakeItYoursLight, alt: 'Player for Android appearance settings' },
    ],
    caption: 'Screens from the current build in progress.',
    ask: [
      'The build runs; the polish is next.',
      'Tell me what a music player must have and it goes in before release.',
    ],
  },

  recorder: {
    tint: ['#DEA858', '#B18646'],
    mini: 'wave',
    meta: 'Audio · Android',
    headline: 'A voice recorder that shows you the sound.',
    lede: 'Record with a live waveform and a running clock, and drop a mark at the moment something matters.',
    body: [
      'Afterwards, trim, cut and fade without ever overwriting the original — every edit is undoable until you save it.',
      "Recordings are files on your phone in WAV, M4A or OPUS — not entries in someone's cloud.",
    ],
    features: [
      'Live waveform, dB meter, mono clock',
      'Marks while recording, 1× / 4× / 16× zoom',
      'Cut, split, fade — undoable until you save',
      'Record straight into a selection',
      'Playback 0.25× to 2×, −15s / +15s',
      'Optional projects, starred takes, search',
      'WAV / M4A / OPUS, voice to studio quality',
      'Same themes, accents and app icons',
    ],
    shots: [
      { dark: recorderLibrary, light: recorderLibraryLight, alt: 'Recorder for Android showing saved voice recordings' },
      { dark: recorderProject, light: recorderProjectLight, alt: 'Recorder for Android recording with a live waveform' },
      { dark: recorderEditor, light: recorderEditorLight, alt: 'Recorder for Android cut and fade editor' },
      { dark: recorderSettings, light: recorderSettingsLight, alt: 'Recorder for Android recording quality settings' },
    ],
    caption: 'Screens from the current build in progress.',
    ask: [
      'The build runs; the polish is next.',
      'Tell me what a recorder must have and it goes in before release.',
    ],
  },

  files: {
    tint: ['#61BF8D', '#4D9870'],
    mini: 'panes',
    meta: 'File manager · Android',
    headline: 'Two folders open at once.',
    lede: 'A two-pane file manager, the way they used to be.',
    body: [
      'Mark what you want in the active pane, and copy or move goes into the other one. Portrait swipes between the panes; landscape shows both side by side.',
      'No file browser wants to be a homepage, so this one is a list, a footer and five buttons.',
    ],
    features: [
      'Copy, move, rename, delete, new folder',
      'Undo on the last operation',
      'Internal storage and SD card',
      'Filter, sort, folders-first, hidden files',
      'Comfortable or compact rows, kB or KiB',
      'Free space shown per pane',
    ],
    shots: [
      { dark: filesRoot, light: filesRootLight, alt: 'Files for Android showing internal storage in a two-pane layout' },
      { dark: filesFolder, light: filesFolderLight, alt: 'Files for Android browsing a folder' },
      { dark: filesMarked, light: filesMarkedLight, alt: 'Files for Android with files marked for copy' },
      { dark: filesSettings, light: filesSettingsLight, alt: 'Files for Android settings' },
    ],
    caption: 'Screens from the current build in progress.',
    ask: [
      'The build runs; the polish is next.',
      'Tell me what a file manager must have and it goes in before release.',
    ],
  },

  shot: {
    tint: ['#D96B8B', '#AD556F'],
    mini: 'reticle',
    meta: 'Screenshots · macOS and Windows',
    headline: 'Take the shot. Say what matters on it.',
    lede: 'A screenshot tool should take the picture, let you mark it up and get out of the way. This one does that on macOS and Windows.',
    body: [
      'Drag out an area, grab a window with its shadow, or let it scroll a long page and stitch the frames back together. Then arrows, boxes, numbered steps, a blur over what should not be in the picture, and a ruler that writes the measurement into the image. It reads the text out of a screenshot too, so a number on screen becomes a number you can paste.',
      'There is no account, no library in the cloud and no upload. A screenshot is a file on your disk, which is what it always was.',
    ],
    highlights: [
      { mini: 'marquee', title: 'Capture', body: 'Area, window, fullscreen, delayed — or a scrolling page stitched back into one image.', tint: ['#718CFF', '#5A70CC'] },
      { mini: 'arrow', title: 'Annotate', body: 'Arrows, shapes, text, counters, freehand, highlighter, blur. Every object stays editable.', tint: ['#AD8DFF', '#8A70CC'] },
      { mini: 'read', title: 'Read', body: 'Pull the text out of any screenshot, decode a QR code, lift a colour in HEX, RGB, HSL or OKLCH.', tint: ['#DEA858', '#B18646'] },
      { mini: 'pin', title: 'Keep', body: 'Pin a shot on top of everything, or drop it on a backdrop and export it finished.', tint: ['#61BF8D', '#4D9870'] },
    ],
    features: [
      'Area, window, fullscreen and delayed capture',
      'Scrolling capture, stitched by overlap',
      'Arrows, shapes, text, counters, freehand',
      'Blur and pixelate: area, text-only or erase',
      'Ruler and guides that imprint measurements',
      'Colour picker: HEX, RGB, HSL, OKLCH',
      'Contrast checker with WCAG and APCA',
      'Text recognition and QR decoding',
      'Pin a shot above every other window',
      'Backdrop: gradient, padding, shadow, corners',
      'Undo everything; the original is never touched',
      'Light, dark and pure black, five accents',
    ],
    shots: [
      { dark: shotEditor, light: shotEditorLight, alt: 'Simplify my Shot editor for macOS with an arrow, a rounded rectangle and a counter placed on a screenshot' },
      { dark: shotCapture, light: shotCaptureLight, alt: 'Area capture in Simplify my Shot: the screen dimmed behind a selection with a live size readout' },
      { dark: shotBackdrop, light: shotBackdropLight, alt: 'The backdrop tool in Simplify my Shot putting a screenshot on a gradient with padding and a shadow' },
      { dark: shotSettings, light: shotSettingsLight, alt: 'Hotkey settings in Simplify my Shot for macOS' },
    ],
    caption: 'Interface previews drawn from the build in progress — macOS shown, Windows is the same app.',
    ask: [
      'Built on the same design system as the phone apps.',
      'Tell me what a screenshot tool must have and it goes in before release.',
    ],
  },
};
