# Burn & Shed

I want to build a simple mobile app called Forget About It. The app is for people who feel frustrated, angry, or upset and want a quick, private way to let go.

The app should have five main tabs in the bottom navigation bar:

Vent Box (Shred It)

A text input where users type what’s bothering them.

When they press "Shred It," the text disappears with a fun shredder animation (like paper strips or confetti).

Add sound effects if possible (paper tearing/shredding).

The text should not be saved anywhere (privacy is key).

Burn It Note

Similar to Vent Box: user writes their frustration.

On pressing "Burn It," the text fades away with a fire or smoke animation.

Include a crackling fire sound if possible.

Again, don’t save the text.

Laugh Break

A tab that shows quick jokes or memes to lighten the mood.

If easy, connect to a free joke API (like JokeAPI
) to pull one-liner jokes.

If not, preload some short jokes into the app.

User can tap “Next” to see another joke.

1-Min Breathing Reset

A simple breathing exercise with a calming animation.

Example: a circle expands/contracts with instructions like “Breathe in” / “Breathe out.”

Timer counts down 60 seconds.

Soft background sound or vibration optional.

Let Go Tracker

Tracks how many times the user has shredded or burned notes.

Show total count + streaks (e.g., “You’ve let go 5 times this week”).

Add simple badges like “Zen Starter” or “Let It Go Pro.”

Design Guidelines:

Simple, minimal, calming interface (use soft colors like blue, purple, orange for fire).

Rounded corners, soft shadows, playful animations.

Keep everything lightweight and easy to use.

Extra Notes:

This should be a mobile-first app, ready for iOS and Android.

Local storage only (no cloud or server required for MVP).

This project was built with [Lovable](https://lovable.dev).

**Live app**: https://burnandshed.lovable.app

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/b46f5745-3a91-4fdf-9124-84aec13eba7c).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
