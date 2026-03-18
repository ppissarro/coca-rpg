/**
 * SAMIZDAT game state – level flow and flags
 */

export const LEVELS = {
  WAYNES_PLACE: 'waynes_place',
  FALL_SEQUENCE: 'fall_sequence',
  EXECUTIVE_SUITE: 'executive_suite',
  SUPREME_COURT_COMBAT: 'supreme_court_combat',
}

export const GAME_STATE = {
  WAYNES_PLACE: 'waynes_place',
  FALL_SEQUENCE: 'fall_sequence',
  TRANSFORMATION: 'transformation',
  EXECUTIVE_SUITE: 'executive_suite',
  TRANSITION_TO_SUITE: 'transition_to_suite',
  SHATTER: 'shatter',
  SUPREME_COURT_COMBAT: 'supreme_court_combat',
  GAME_OVER: 'game_over', // legacy alias
  COCA: 'coca', // coca_bg landing level (after rabbithole)
}

export const GAME_FLAGS = {
  TRANSFORMED: 'transformed',
  BIBLE_READ: 'bible_read',
}
