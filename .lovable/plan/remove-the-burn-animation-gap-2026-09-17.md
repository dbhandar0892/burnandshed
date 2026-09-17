# Remove the burn animation gap

## Change
- Start the match sequence as the final “Let’s burn this” letters finish, with no blank pause.
- Keep the existing phrase, match movement, right-to-left letter burning, sound, and completion behavior.

## Technical details
- Align the phrase duration with its per-letter animation timing.
- Briefly overlap the outgoing phrase and incoming match stage so rendering and position measurement cannot create an empty frame.
- Verify the transition in the live preview and confirm the project still builds cleanly.
