# Lab Integration Todo List

## Phase 1: Terminal Execution Engine (app.js)
- [ ] **Variable Timing:** Update the `typeLines` typing loop to allow for variable pauses. (e.g., fast typing for commands, 1-2 second pauses for `[ INFO ]` lines to simulate computation).
- [ ] **Type Flag Logic:** Add a check at the end of the typing loop in `app.js`. If `exp.type === 'interactive'`, read `exp.ui`.
- [ ] **UI Injection:** Create the DOM injection logic to safely append `exp.ui` HTML into the terminal without clearing the typed logs.
- [ ] **Terminal CSS Updates:** Add base styles in `style.css` for `.terminal-ui-block`, text inputs, and buttons so they match the Hacker Green / Dark IDE theme.

## Phase 2: Interactive Project Wiring
- [ ] **Transformer Stock Predictor (EXP_01):**
    - [ ] Attach event listener to `#run-stock-btn`.
    - [ ] Add hardcoded mock data for 2-3 popular tickers (e.g., RELIANCE, TCS) to simulate API return.
    - [ ] Implement a typing animation for the response data into `#stock-output`.
- [ ] **Handwriting Generation (EXP_02):**
    - [ ] Attach event listener to `#run-hw-btn`.
    - [ ] Prepare 3-5 pre-generated images of specific words from the IAM-OnDB dataset.
    - [ ] Write logic: If user types a supported word, display the image in `#hw-output`. If not, return a terminal error `[ ERROR ] Out of vocabulary constraint.`
- [ ] **Hybrid Movie Recommender (EXP_04):**
    - [ ] Attach event listener to `#run-movie-btn`.
    - [ ] Create a JSON array containing 3 mock movie queries and their top 3 recommended counterparts.
    - [ ] Format the return data as a CLI table or JSON block inside the terminal.

## Phase 3: Polish & Edge Cases
- [ ] **Input Sanitization:** Ensure users can't break the HTML by typing special characters into the terminal inputs.
- [ ] **Enter Key Support:** Bind the `Enter` key to trigger the same function as clicking the `[ RUN / GENERATE ]` buttons.
- [ ] **Debouncing:** Prevent users from spamming the run buttons while an animation or "fetch" is actively happening.
- [ ] **Cleanup:** Ensure that switching to a new experiment completely clears out any active event listeners from the previous UI block to prevent memory leaks.