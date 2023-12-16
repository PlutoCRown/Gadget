## 这段JSX会被转换为怎么样的VDOM?

```jsx
const MAIN = () => (<>
  <div ref={Ref}>
    <Provider value={1}>
      <App>
        "TEXT_NODE"
      </App>
    </Provider>
  </div>
</>)


const App = React.Memo(({ child }) => {
  return (
    <span>{child}</span>
  )
})

```
