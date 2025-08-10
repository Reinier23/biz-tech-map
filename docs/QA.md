# QA Manual Testing Checklist

## Overview
This document provides step-by-step manual testing procedures for the Tech Stack Mapper application. Use the `/qa` dev route for quick test data setup.

## Pre-Testing Setup

1. **Access QA Page**
   - Navigate to `/qa` (dev-only route)
   - Click "Seed Sample Stack" to load 12 test tools
   - Verify tools are loaded across different categories (Sales, Marketing, Service, Analytics)

## Core Functionality Tests

### 1. Tool Management
**Goal**: Verify tool addition, categorization, and logo handling

**Steps**:
1. Navigate to `/add-tools`
2. Search for a known tool (e.g., "Slack")
3. Add the tool and verify:
   - Logo appears (or fallback icon if logo fails)
   - Category is auto-assigned
   - Tool appears in tools list
4. Try adding a tool with no logo
   - Verify fallback behavior works
5. Remove a tool and confirm it disappears

**Expected**: Tools add/remove smoothly, logos load or fallback gracefully, categories auto-assign

### 2. Tech Map Visualization
**Goal**: Ensure React Flow map renders correctly with lanes

**Steps**:
1. Navigate to `/tech-map` (ensure you have 5+ tools loaded)
2. Verify:
   - Tools appear as nodes in correct category lanes
   - Lanes are properly labeled (Sales, Marketing, Service, etc.)
   - Map is draggable and zoomable
   - Broken logo URLs show fallback icons
3. Try dragging nodes around
4. Test zoom controls and fit-to-view

**Expected**: Map renders with clear lanes, all tools visible, interactive controls work

### 3. Consolidation Analysis
**Goal**: Verify overlap detection and recommendations

**Steps**:
1. Ensure sample stack is loaded (use `/qa` if needed)
2. Navigate to `/consolidation`
3. Click "Analyze Stack" and verify:
   - Analysis completes without errors
   - Tools with overlaps get "Evaluate" or "Replace" recommendations
   - Clear reasoning is provided for each suggestion
   - Similar tools are grouped together (e.g., multiple CRMs)
4. Test filtering by recommendation type
5. Try accepting/rejecting suggestions

**Expected**: Clear overlap detection, actionable recommendations, smooth filtering

### 4. Cost Analysis
**Goal**: Verify cost calculations and totals

**Steps**:
1. With tools loaded, check cost displays:
   - Individual tool costs show (or "Unknown" if no data)
   - Category totals sum correctly
   - Overall total reflects all tool costs
2. Add/remove tools and verify totals update
3. Check consolidation page for cost savings estimates

**Expected**: Accurate cost calculations, real-time updates, savings estimates

### 5. Staging & Apply Changes
**Goal**: Test the workflow for applying consolidation suggestions

**Steps**:
1. From consolidation page, stage several changes:
   - Accept some "Replace" suggestions
   - Accept some "Evaluate" suggestions
2. Review staged changes summary
3. Click "Apply Changes"
4. Navigate to tech map and verify:
   - Removed tools no longer appear
   - Tech map reflects the new stack
5. Check audit log for change events

**Expected**: Staged changes apply correctly, tech map updates, audit events logged

### 6. Export & Sharing
**Goal**: Verify PNG/PDF export and share functionality

**Steps**:
1. **PNG Export**:
   - From tech map, click export PNG
   - Verify download starts and image contains the map
2. **PDF Export**:
   - Try exporting both tech map and consolidation report as PDF
   - Verify PDF downloads and opens correctly
3. **Share Link**:
   - Create a share link
   - Open link in incognito/private window
   - Verify shared view is read-only
   - Confirm all tools and layout are preserved

**Expected**: Exports work without errors, share links create read-only views

### 7. Settings & Persistence
**Goal**: Test settings changes and data persistence

**Steps**:
1. Navigate to `/settings`
2. Modify category lane configuration:
   - Add a custom category
   - Reorder existing categories
   - Change lane colors/styling
3. Navigate back to tech map
4. Verify changes are reflected in the map layout
5. Refresh the page and confirm settings persist
6. Test category assignments for new tools

**Expected**: Settings changes apply immediately and persist across sessions

### 8. Audit Logging
**Goal**: Verify key events are tracked

**Steps**:
1. Navigate to `/audit`
2. Perform various actions:
   - Add/remove tools
   - Run consolidation analysis
   - Export files
   - Create share links
3. Return to audit page and verify:
   - Events appear in chronological order
   - Event details are meaningful
   - Filtering and search work
   - CSV export functions

**Expected**: All major actions logged with clear details, audit interface functional

## Error Handling Tests

### 9. Network Failures
**Steps**:
1. Disconnect network
2. Try tool search, export, or share operations
3. Verify graceful error messages appear
4. Reconnect and confirm functionality resumes

### 10. Invalid Data
**Steps**:
1. Try accessing `/share/invalid-id`
2. Verify proper error handling
3. Test with malformed tool data (if applicable)

### 11. Performance
**Steps**:
1. Load 20+ tools
2. Verify map still renders smoothly
3. Test search responsiveness with large datasets
4. Check export performance with complex maps

## Browser Compatibility
Test on:
- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Mobile browsers (iOS Safari, Chrome Android)

## Regression Checks
Before releases, verify:
- [ ] All exports work (PNG, PDF)
- [ ] Share links are accessible
- [ ] Tech map renders on various screen sizes
- [ ] No console errors during normal flows
- [ ] Audit log captures all expected events
- [ ] Settings persist and apply correctly

## Quick Test Script
Use the `/qa` page to run through core flows quickly:

1. Seed sample data
2. Navigate to tech map → verify rendering
3. Go to consolidation → run analysis
4. Export PNG and PDF
5. Create and test share link
6. Check audit log for events
7. Clear data and repeat

## Known Issues
Document any known issues or browser-specific quirks here.

## Test Data
The QA page provides 12 sample tools across 4 categories:
- **Sales**: Salesforce, Pipedrive, HubSpot CRM
- **Marketing**: Mailchimp, Marketo, HubSpot Marketing  
- **Service**: Zendesk, Intercom, Freshdesk
- **Analytics**: Google Analytics, Mixpanel, Amplitude

This mix ensures overlaps for testing consolidation suggestions.