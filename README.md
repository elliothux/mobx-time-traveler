# mobx-time-traveler
Make mobx store time-traveling with undo &amp; redo easily

## Installation
```bash
npm install --save mobx-time-traveler
```

## Usage
```tsx
import { action, observable } from 'mobx';
import { observer } from 'mobx-react';
import { withTimeTravel, withHistory, timeTraveler } from 'mobx-time-traveler';

@withTimeTravel
class MyStore {
    @observable
    foo = 1;

    @action
    @withHistory
    setFoo = (foo: number) => {
        this.foo = 1;
    }
}

const myStore = new MyStore();

const App = observer(() => {
    const { undo, redo, canUndo, canRedo } = timeTraveler;
    const { foo } = myStore;

    return (
        <div>
            <p>{foo}</p>
            {canUndo ? <button onClick={undo}>undo</button> : null}
            {canRedo ? <button onClick={redo}>redo</button> : null}
        </div>
    );
});
```

## API

* withTimeTravel
* withHistory
* timeTraveler
* configure