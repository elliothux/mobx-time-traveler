# mobx-time-traveler
Make mobx store time-traveling with undo &amp; redo easily

## Installation
```bash
npm install --save mobx-time-traveler
```

## Usage
```tsx
import { observable } from 'mobx';
import { observer } from 'mobx-react';
import { withTimeTravel, actionWithSnapshot, timeTraveler } from 'mobx-time-traveler';

// Make this store's state can be collected and restored by time-traveler
// Multi stores are supported, but make sure that every store has an unique class name
@withTimeTravel
class MyStore {
    @observable
    foo = 1;

    // Mark this action's effects be recorded by time-traveler
    // Can also use "@action @withSnapshot"
    @actionWithSnapshot
    setFoo = (foo: number) => {
        this.foo = 1;
    }
}

// Make sure every store will be instantiated only once
const myStore = new MyStore();

const App = observer(() => {
    // Using time-traveler's state in component with observer
    const { undo, redo, canUndo, canRedo } = timeTraveler;
    const { foo, setFoo } = myStore;
    
    const onChange = useCallback(() => setFoo(Math.random() * 100), []);

    useEffect(() => {
        // Mark state of this moment as initial state
        timeTraveler.initSnapshots();
    }, []);

    return (
        <div>
            <p>{foo}</p>
            <button onClick={onChange}>random change</button>
            {canUndo ? <button onClick={undo}>undo</button> : null}
            {canRedo ? <button onClick={redo}>redo</button> : null}
        </div>
    );
});
```

## API

* withTimeTravel
* withSnapshot
* actionWithSnapshot
* timeTraveler
* configure