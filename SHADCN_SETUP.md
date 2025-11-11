# Shadcn UI Integration Setup

This document describes the setup completed to integrate the GooeyText component with shadcn/ui structure.

## ✅ Completed Setup

### 1. **Tailwind CSS Configuration**
- ✅ Installed Tailwind CSS v3.4.0 (compatible with Create React App)
- ✅ Created `tailwind.config.js` with shadcn-compatible theme configuration
- ✅ Created `postcss.config.js` for PostCSS processing
- ✅ Updated `src/index.css` with Tailwind directives and shadcn CSS variables

### 2. **Path Aliases (@/)**
- ✅ Configured TypeScript path aliases in `tsconfig.json`
- ✅ Set up CRACO (Create React App Configuration Override) for webpack alias resolution
- ✅ Created `craco.config.js` to enable `@/` imports
- ✅ Updated npm scripts to use `craco` instead of `react-scripts`

### 3. **Shadcn Structure**
- ✅ Created `src/lib/utils.ts` with the `cn` utility function
- ✅ Created `src/components/ui/` directory for shadcn components
- ✅ Component placed at `src/components/ui/gooey-text-morphing.tsx`

### 4. **Component Integration**
- ✅ Component uses proper imports: `@/lib/utils`
- ✅ Removed Next.js-specific `"use client"` directive
- ✅ Component exports `GooeyText` as a named export
- ✅ Updated `App.tsx` to import from the new location

## 📁 Project Structure

```
client/
├── src/
│   ├── components/
│   │   ├── ui/
│   │   │   └── gooey-text-morphing.tsx  ← Component location
│   │   ├── Layout.tsx
│   │   └── ProtectedRoute.tsx
│   ├── lib/
│   │   └── utils.ts  ← cn utility function
│   ├── index.css  ← Tailwind directives
│   └── App.tsx  ← Updated imports
├── craco.config.js  ← Path alias configuration
├── tailwind.config.js  ← Tailwind configuration
├── postcss.config.js  ← PostCSS configuration
└── tsconfig.json  ← Path aliases configuration
```

## 🚀 Usage

### Running the Project

```bash
cd client
npm start
```

The component is already integrated in `App.tsx`:

```tsx
import { GooeyText } from "./components/ui/gooey-text-morphing";

<GooeyText
  texts={["Design", "Engineering", "Is", "Awesome"]}
  morphTime={1}
  cooldownTime={0.25}
  className="font-bold"
/>
```

### Component Props

- `texts` (required): Array of strings to morph between
- `morphTime` (optional): Duration of morph animation in seconds (default: 1)
- `cooldownTime` (optional): Cooldown between morphs in seconds (default: 0.25)
- `className` (optional): Additional CSS classes for the container
- `textClassName` (optional): Additional CSS classes for the text elements

## 📝 Important Notes

### Why `/components/ui` Folder?

The `/components/ui` folder is the standard location for shadcn/ui components. This convention:
- Keeps UI components organized and easily discoverable
- Follows shadcn/ui best practices
- Makes it easy to add more shadcn components in the future
- Separates reusable UI components from application-specific components

### Path Aliases (@/)

Path aliases are configured to allow imports like `@/lib/utils` instead of relative paths like `../../lib/utils`. This:
- Makes imports cleaner and easier to refactor
- Follows shadcn/ui conventions
- Requires CRACO to work with Create React App (which doesn't support path aliases natively)

### Dependencies

All required dependencies are already installed:
- `clsx`: For conditional class names
- `tailwind-merge`: For merging Tailwind classes
- `tailwindcss`: CSS framework
- `@craco/craco`: For webpack configuration override

## 🔧 Future shadcn Components

To add more shadcn components:

1. Use the shadcn CLI (if preferred):
   ```bash
   npx shadcn@latest add [component-name]
   ```

2. Or manually:
   - Place components in `src/components/ui/`
   - Use `@/lib/utils` for the `cn` function
   - Import using path aliases: `@/components/ui/[component-name]`

## 🐛 Troubleshooting

If path aliases don't work:
1. Ensure CRACO is installed: `npm install -D @craco/craco`
2. Verify `craco.config.js` exists and is configured correctly
3. Check that npm scripts use `craco` instead of `react-scripts`
4. Restart the development server

If Tailwind styles don't apply:
1. Verify `src/index.css` includes Tailwind directives
2. Check `tailwind.config.js` content paths include your files
3. Ensure PostCSS is configured correctly
4. Clear the build cache and restart

