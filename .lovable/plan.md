# Realistic Burn It Away sequence

## What will change
- Rebuild the burn sequence so the match visibly lights first, then travels directly to the final visible character.
- Make contact between the match flame and the final character clear before the message starts burning.
- Burn every non-space character individually from right to left, preserving words, spaces, punctuation, and line breaks.
- Replace the oversized soft blobs with compact layered flames, charred letter edges, embers, ash, and drifting smoke.
- Synchronize the match strike, ignition, fire crackle, character timing, and final cleanup.

## Technical details
- Measure the final character inside the message area and position the animated match at that exact location.
- Render the message as an ordered character stream rather than splitting only on spaces.
- Use staged CSS animations for match entry/contact, per-character ignition, charring, collapse, embers, and smoke.
- Keep the existing emotion-based flame colors while making the flame shape and scale physically believable.
- Respect reduced-motion settings and keep the current tracker/privacy behavior unchanged.

## Verification
- Test short text, multiple words, punctuation, and multiline messages.
- Confirm the final character ignites first and each preceding character follows in order.
- Check the effect in the current narrow preview and a desktop viewport, including sound and cleanup timing.
