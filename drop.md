Create a two-panel authentication interface where the left branding panel and the right form panel can slide and swap positions depending on whether the user is on Login or Register mode. The design must match the reference layout and use all specifications below.

1. Main Card Layout

Center a large UI card on a gradient background (blue → purple → pink).

Card has:

Rounded corners (20–25px)

Soft shadow

Two internal panels:

Left panel: Branding (dark navy)

Right panel: Authentication form

Panels must support horizontal sliding transitions to switch modes.

2. Left Panel (Brand Section)
Appearance

Width ≈ 40%

Background: dark navy (#1C2331)

Right edge has a curved inward cut forming an arrow shape.

Smooth padding around all content.

Content

complaint box icon

Brand name: Complaint Management Portal

Don’t hesitate, submit your complaint here and let it reach the right people quickly. Track its progress easily and be confident that your voice will be heard.


Color: soft pink (#E77A8E), white text

Behavior (CRITICAL)

Login Mode: Panel appears on the left

Register Mode: Panel slides to the RIGHT

Returning to Login: Panel slides back to the LEFT

Animations must be smooth, synced with form panel movement.

3. Circle Toggle Button (Between Panels)

Circular shape (~60–70px)

Gradient pink (#E77A8E → #C96A81)

Arrow icon inside

Overlaps the boundary between both panels

Clicking this button toggles between:

Login → Register

Register → Login

Optional: slight rotation animation during transitions.

4. Right Panel (Form Section)

White/light background with clean spacing.
This panel displays Login form or Register form depending on mode.

5. Login Form (Displayed When Branding Panel Is on Left)
Header

Title: Welcome Back!

Subtitle: Sign in to continue

Inputs

Username or Email

Password

Extras Row

Remember me checkbox

“Forgot Password?” link (right aligned)

Login Button

Pill-shaped

Background: pink/red (#E77A8E)

White text: Login

Footer

Text: Don’t have an account?

Link: Register

Clicking it triggers Register mode animation

6. Register Form (Displayed When Branding Panel Shifts Right)
Header

Title: Create Account

Subtitle: Join us and get started!

Form Fields (exact required labels + placeholders)

Username *
Placeholder: Choose a username

Email *
Placeholder: your.email@example.com

Full Name *
Placeholder: Enter your full name

Contact Number
Placeholder: Optional

Department
Placeholder: Optional

Password

Confirm Password

Register Button

Same styling as Login button

Text: Register

Footer

Text: Already have an account?

Link: Login

7. CRITICAL ANIMATION LOGIC (Form/Brand Sliding)

Your AI agent must implement this exact behavior:

When switching from LOGIN → REGISTER

Branding panel (navy left panel)
→ Slides to the right

Form panel (login form on right)
→ Slides to the left and transforms into the register form

Both panels move simultaneously over 400–600ms

Use transform: translateX(...) with ease-in-out

When switching from REGISTER → LOGIN

Triggered by either:

Click “Already have an account?”

Click the center circle button

The final output must include:

Two sliding panels

Complete Login form

Complete Register form with all your custom fields

Branding panel

Sliding animations

Center toggle button


Perform the reverse animation:

Branding panel slides back to the LEFT

Form panel slides back to the RIGHT

Display login fields once in position

Use the same 400–600ms ease-in-out animation

Animation Constraints

No fade-out; content stays attached to its sliding panel

No reposition jumps

Panels must swap positions smoothly

Circular middle button may animate but should remain centered between panels

8. Close Button (Modal Style)

Small white circle with black “X”

Positioned at top-right of the entire card

Always visible

9. Responsiveness

On mobile/small screens:

Panels stack vertically

Sliding transitions should convert to vertical sliding

Login → Register: slide upward or downward

Register → Login: reverse slide

Maintain spacing and readability

10. Output Requirements for the AI Agent

The final output must include:

Two sliding panels

Complete Login form

Complete Register form with all your custom fields

Branding panel

Sliding animations

Center toggle button

Responsiveness

Correct swapping behavior in both directions