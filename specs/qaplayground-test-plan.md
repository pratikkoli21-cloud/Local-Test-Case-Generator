# Comprehensive Test Plan: QA Playground Practice

## Overview
This document outlines the test scenarios for the web elements and interactive modules located at `https://qaplayground.com/practice`. It is designed to ensure maximum test coverage across functional behavior, edge cases, boundary conditions, and negative testing scenarios, specifically targeting common UI automation challenges.

---

## Scenario 1: Standard Form Authentication (Happy Path)

**Assumptions about starting state:** A blank/fresh browser session with no cookies, session storage, or local storage.

**Step-by-step instructions:**
1. Navigate to `https://qaplayground.com/practice`.
2. Locate and click on the "Login" or "Authentication" practice module.
3. Enter a valid registered username (e.g., `testuser`) into the "Username" input field.
4. Enter the corresponding valid password into the "Password" input field.
5. Click the "Submit" or "Login" button.

**Expected outcomes:**
- The system should authenticate the user and redirect them to a secure/welcome page.
- A success message (e.g., "Welcome back!") should be visibly rendered in the DOM.

**Success criteria:** User is successfully logged in and the welcome message is verifiable.
**Failure conditions:** The user is rejected, the page crashes, or no success feedback is provided.

---

## Scenario 2: Form Authentication with Invalid Credentials (Error Handling)

**Assumptions about starting state:** A blank/fresh browser session.

**Step-by-step instructions:**
1. Navigate to `https://qaplayground.com/practice`.
2. Open the "Login" or "Authentication" practice module.
3. Enter an invalid username (e.g., `invalid_user`) and a random incorrect password.
4. Click the "Submit" button.
5. Clear the form and attempt to submit with entirely blank fields.

**Expected outcomes:**
- The system must gracefully reject the login attempts.
- Clear, localized error messages stating "Invalid credentials" or "Fields cannot be blank" should appear.

**Success criteria:** Appropriate error messages are displayed for both bad data and missing data, and the user remains on the unauthenticated login form.
**Failure conditions:** The user is incorrectly logged in, the system throws an unhandled 500 server exception, or no error message appears.

---

## Scenario 3: File Upload with Boundary Conditions (Edge Cases)

**Assumptions about starting state:** A blank/fresh browser session.

**Step-by-step instructions:**
1. Navigate to `https://qaplayground.com/practice`.
2. Click on the "File Upload" practice module.
3. Attempt to upload a file that exceeds the maximum allowed size limit (e.g., > 5MB).
4. Verify the UI for validation error messages.
5. Attempt to upload an unsupported executable file format (e.g., `.exe` or `.sh`).
6. Verify the UI for validation error messages.
7. Finally, upload a valid `.png` file that is under 1MB.

**Expected outcomes:**
- Steps 3 & 5 should trigger specific front-end or back-end validation error messages preventing the upload.
- Step 7 should succeed and display a preview or success text indicator for the successfully uploaded file.

**Success criteria:** Invalid or oversized files are firmly rejected with helpful messages; valid files are successfully processed.
**Failure conditions:** The application crashes upon receiving large/invalid files, bypasses security validations, or fails to upload a valid file.

---

## Scenario 4: Dynamic UI Elements and Client Delays (Functional)

**Assumptions about starting state:** A blank/fresh browser session.

**Step-by-step instructions:**
1. Navigate to `https://qaplayground.com/practice`.
2. Open the "Dynamic Elements" or "Client Delay" module.
3. Click the button that triggers a delayed element rendering (e.g., "Trigger Alert" or "Load Data").
4. Wait for the designated delay period (e.g., 5 seconds) without interacting with the page.
5. Interact with the newly appeared element (e.g., closing the alert or clicking the new dynamic button).

**Expected outcomes:**
- The system should maintain visual stability during the waiting period (e.g., showing a loading spinner).
- The element should appear exactly after the specified delay.
- The element must be fully interactive once rendered.

**Success criteria:** The test runner successfully waits for and interacts with the delayed element without hardcoding excessive static sleeps.
**Failure conditions:** The element never appears, appears too early, or is unclickable when it does appear due to overlays.