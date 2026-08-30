# RuleSwitch — Game Specification

## Game

**Working Name:** RuleSwitch

A fast casual attention and mental-flexibility game where the player follows one simple rule, then adapts instantly when the rule changes.

The game should feel energetic, fair, replayable, and easy to understand within seconds.

## Core Idea

Objects appear on screen.

The player must respond according to the current rule.

Examples:

* Tap blue objects
* Ignore red objects
* Tap odd numbers
* Swipe circles left
* Tap shapes with more than 3 sides
* Tap numbers only if they are inside a triangle

The rule changes during play.

The challenge is adapting quickly without carrying the old rule into the new one.

## Core Gameplay

Each round:

1. Show the current rule clearly.
2. Present one or more objects.
3. Player performs the correct action.
4. Give immediate feedback.
5. Continue with new objects.
6. Change the rule after a defined number of actions or time.
7. Increase complexity as difficulty rises.

The game must never hide the current rule.

## Object Types

Support:

* shapes
* colors
* numbers
* symbols
* positions
* simple combinations

Objects can have attributes such as:

* color
* shape
* size
* number
* fill
* orientation
* container shape
* position

## Rule Types

### Tap Rules

Examples:

* tap blue
* tap circles
* tap even numbers
* tap objects above the center

### Ignore Rules

Examples:

* do not tap red
* ignore triangles
* ignore numbers below 5

### Swipe Rules

Examples:

* swipe circles left
* swipe squares right
* swipe odd numbers up

### Comparison Rules

Examples:

* tap the larger object
* tap the smaller number
* tap the object closest to center

### Conditional Rules

Examples:

* tap blue only if it is a circle
* tap even numbers unless they are red
* swipe right if the number is greater than 5

### Rule Reversal

Examples:

* do the opposite of the displayed instruction
* reverse left/right
* reverse tap/ignore

Use only at higher difficulties.

## Win / Lose Rules

Normal rounds continue until the required number of correct actions is completed.

Mistakes:

* reduce score
* break streak
* may reduce remaining time in timed modes

Do not permanently block the player.

## Scoring

Score should reward:

* correct responses
* response speed
* consecutive correct actions
* higher difficulty
* successful rule switches

Reduce score for:

* incorrect responses
* missed valid targets
* acting on invalid targets

Never allow score below zero.

## Difficulty

### Beginner

* one attribute
* slow pace
* clear rule changes
* large objects
* simple tap/ignore rules

### Easy

* faster pace
* more distractors
* more colors and shapes

### Normal

* multiple rule families
* moderate speed
* occasional conditional rules

### Hard

* faster switches
* two-property conditions
* swipe actions
* stronger distractors

### Expert

* complex conditions
* rapid switching
* similar-looking objects
* reversal rules

### Master

* fast but fair pace
* multi-condition rules
* frequent switching
* highly similar distractors

Difficulty should increase cognitive load, not visual clutter.

## Game Modes

### Journey

Main progression mode.

Introduce:

1. tap rules
2. ignore rules
3. number rules
4. swipe rules
5. comparison rules
6. conditional rules
7. reversal rules

### Endless

Continuous play at chosen difficulty.

### Daily Switch

One identical challenge sequence per day.

Track:

* score
* accuracy
* response time
* mistakes
* streak

### Time Attack

Fixed time limit.

Earn as many points as possible before time ends.

### No Mistakes

Continue until the first incorrect action.

Track longest streak.

## Progression

Track:

* XP
* player level
* total actions
* correct actions
* accuracy
* best response time
* current streak
* longest streak
* best Time Attack score
* best No Mistakes run
* rule categories mastered

Difficulty progression:

**Beginner → Easy → Normal → Hard → Expert → Master**

## Achievements

Include:

* First Switch
* 50 Correct
* 500 Correct
* Perfect Round
* No Mistakes 25
* Speed Switch
* Seven-Day Streak
* Thirty-Day Streak
* Number Master
* Shape Master
* Conditional Master
* Master Difficulty Cleared

## Screens

### Home

Show:

* Journey
* Daily Switch
* Endless
* Time Attack
* No Mistakes
* streak
* level
* stats
* settings

### Tutorial

Interactive tutorial.

Teach:

* read the rule
* react
* recognize rule changes
* avoid carrying over the old rule

### Game

Display:

* current rule prominently
* active objects
* score
* streak
* timer where needed

Rule changes must have clear visual and audio feedback.

### Results

Show:

* score
* accuracy
* mistakes
* average response time
* best streak
* XP

### Stats

Show performance by rule type.

### Achievements

Show locked/unlocked achievements.

### Settings

Include:

* sound
* music
* haptics
* theme
* reduced motion
* difficulty preferences
* reset progress
* privacy information

## Rule Generation

Rules must come from structured rule definitions.

Do not hard-code gameplay into screens.

Each rule should define:

* id
* category
* difficulty
* condition
* expected action
* display text
* compatible object types

## Object Generation

Objects must be procedurally generated.

The generator must:

* include valid targets
* include distractors
* avoid impossible rules
* ensure at least one valid action when required
* avoid unreadable combinations
* respect difficulty

## Rule Validation

Every generated sequence must confirm:

* the current rule is valid
* correct actions can be calculated exactly
* distractors are valid
* no object accidentally satisfies conflicting conditions
* rule text matches rule logic
* swipe direction is unambiguous
* rule switching does not create broken state

Invalid rounds must be regenerated.

## Seeded Generation

Support deterministic generation.

The same:

`seed + game version`

must create the same challenge sequence.

Use for:

* Journey
* Daily Switch
* testing
* bug reproduction

## Daily Challenge

Generate one identical challenge sequence per calendar day.

Requirements:

* same date = same sequence
* deterministic seed
* works offline
* one official result per day
* replay allowed
* replay does not replace first official result
* track score
* track accuracy
* track response time
* track streak

## Feedback

Correct actions:

* subtle positive animation
* sound
* haptic

Incorrect actions:

* clear but brief negative feedback
* no excessive punishment

Rule changes:

* strong visual transition
* sound cue
* brief emphasis on the new rule

## Offline Support

Core gameplay must work offline.

Store locally:

* progress
* XP
* settings
* achievements
* stats
* streaks
* Journey progress
* best scores

No account required.

## Online Features

Do not require a backend initially.

Prepare for later:

* leaderboards
* cloud saves
* friend challenges
* shared Daily Switch rankings

## Monetization

Prepare hooks for:

* limited interstitials between sessions
* optional rewarded ads
* one-time Remove Ads purchase

Never interrupt an active sequence with an ad.

## Visual Direction

Style:

**Energetic, clean, bold, responsive.**

Use:

* strong typography
* clear color hierarchy
* smooth transitions
* fast feedback
* minimal clutter
* visually obvious rule changes

The game should feel lively without becoming stressful.

## Sound & Haptics

Include:

* tap feedback
* swipe feedback
* correct sound
* incorrect sound
* rule-change sound
* streak sound
* achievement sound
* optional background music

All configurable.

## Accessibility

Support:

* large tap targets
* high contrast
* reduced motion
* colorblind-safe cues
* clear rule text
* responsive layouts
* do not rely only on color

## Analytics

Track:

* app_opened
* tutorial_started
* tutorial_completed
* round_started
* round_completed
* action_correct
* action_incorrect
* rule_changed
* rule_type
* difficulty_selected
* daily_started
* daily_completed
* time_attack_started
* time_attack_completed
* no_mistakes_started
* no_mistakes_ended
* achievement_unlocked

Do not collect sensitive personal information.

## Testing

Test:

* rule evaluation
* object generation
* rule validation
* conditional logic
* swipe logic
* reversal logic
* scoring
* streak logic
* seeded generation
* persistence
* daily seed
* progression
* achievements

Generate large batches of sequences and verify all expected actions are valid.

## Definition of Done

This is not a prototype.

The game is complete when:

* Journey works
* Endless works
* Daily Switch works
* Time Attack works
* No Mistakes works
* all rule categories work
* rule switching works
* procedural generation works
* validation works
* progression saves
* achievements work
* stats work
* settings work
* offline play works
* Android build works
* responsive web works
* PWA works
* tests pass
* TypeScript passes
* lint passes
* README explains setup, testing, build, and deployment
* no core functionality remains as placeholders or TODOs
