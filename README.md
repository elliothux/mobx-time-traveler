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

@withTimeTravel
class MyStore {
    @observable
    foo = 1;

    @actionWithSnapshot
    setFoo = (foo: number) => {
        this.foo = 1;
    }
}

const myStore = new MyStore();

const App = observer(() => {
    const { undo, redo, canUndo, canRedo } = timeTraveler;
    const { foo, setFoo } = myStore;
    
    const onChange = useCallback(() => setFoo(Math.random() * 100), []);

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