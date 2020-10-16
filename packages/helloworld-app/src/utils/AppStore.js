import { types, flow } from 'mobx-state-tree'

export const CONTRACT_HELLOWORLD = 5;

export const createHelloWorldAppStore = (defaultValue = {}, options = {}) => {
  const HelloWorldAppStore = types
    .model('HelloWorldAppStore', {
      counter: types.maybeNull(types.number),
      note: types.maybeNull(types.string)
    })
    .actions(self => ({
      setCounter (num) {
        self.counter = num
      },
      async queryCounter (runtime) {
        return await runtime.query(CONTRACT_HELLOWORLD, 'GetCount')
      },
      setNote (note) {
        self.note = note
      },
      async queryNote (runtime) {
        return await runtime.query(CONTRACT_HELLOWORLD, 'GetNote')
      }
    }))

  return HelloWorldAppStore.create(defaultValue)
}

