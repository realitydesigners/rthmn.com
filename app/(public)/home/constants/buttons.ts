export type SceneState = {
  id: string;
  buttonName: string; // Name in Spline scene
  nextState?: string; // ID of the next state to transition to
  position?: {
    x: number;
    y: number;
    z: number;
  };
  // Add any other state-specific properties here
};

export const SCENE_STATES: Record<string, SceneState> = {
  baseState: {
    id: 'baseState',
    buttonName: 'BaseState',
    nextState: 'state1',
    position: { x: 0, y: -294.22, z: -786.24 }
  },
  state1: {
    id: 'state1',
    buttonName: 'State1',
    nextState: 'state2',
    position: { x: 0, y: -500, z: -900 }
  },
  state2: {
    id: 'state2',
    buttonName: 'State2',
    nextState: 'state3',
    position: { x: 0, y: -750, z: -1200 }
  },
  state3: {
    id: 'state3',
    buttonName: 'State3',
    nextState: 'state4',
    position: { x: 0, y: -1000, z: -1500 }
  }
  // Add more states as needed...
};
