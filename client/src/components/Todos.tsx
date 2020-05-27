import dateFormat from 'dateformat'
import { History } from 'history'
import update from 'immutability-helper'
import * as React from 'react'
import {
  Button,
  Checkbox,
  Divider,
  Dimmer,
  Grid,
  Icon,
  Input,
  Image,
  Loader,
  Modal
} from 'semantic-ui-react'

import { createTodo, deleteTodo, getTodos, patchTodo } from '../api/todos-api'
import Auth from '../auth/Auth'
import { Todo } from '../types/Todo'
import { EditTodo } from './EditTodo'

interface TodosProps {
  auth: Auth
  history: History
}

interface TodosState {
  todos: Todo[]
  addImageModalOpen: boolean
  newTodoName: string
  addingTodo: boolean
  loadingTodos: boolean
}

export class Todos extends React.PureComponent<TodosProps, TodosState> {
  state: TodosState = {
    todos: [],
    addImageModalOpen: false,
    newTodoName: '',
    addingTodo: false,
    loadingTodos: true
  }

  handleNameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    this.setState({ newTodoName: event.target.value })
  }

  onTodoCreate = async (event: React.ChangeEvent<HTMLButtonElement>) => {
    try {
      this.setState({ addingTodo: true })

      const dueDate = this.calculateDueDate()
      const newTodo = await createTodo(this.props.auth.getIdToken(), {
        name: this.state.newTodoName,
        dueDate
      })

      this.setState({
        addingTodo: false,
        todos: [...this.state.todos, newTodo],
        newTodoName: ''
      })
    } catch {
      this.setState({ addingTodo: false })
      alert('Todo creation failed')
    }
  }

  onTodoDelete = async (todoId: string) => {
    const prevTodo = this.state.todos

    // set state first to remove delay without setting loading state
    this.setState({
      todos: this.state.todos.filter(todo => todo.todoId != todoId)
    })

    try {
      await deleteTodo(this.props.auth.getIdToken(), todoId)
    } catch {
      // revert back state on error
      this.setState({
        todos: prevTodo
      })

      alert('Todo deletion failed')
    }
  }

  onTodoCheck = async (pos: number) => {
    const todo = this.state.todos[pos]

    // set state first to remove delay without setting loading state
    this.setState({
      todos: update(this.state.todos, {
        [pos]: { done: { $set: !todo.done } }
      })
    })

    try {
      await patchTodo(this.props.auth.getIdToken(), todo.todoId, {
        name: todo.name,
        dueDate: todo.dueDate,
        done: !todo.done
      })
    } catch {
      // revert back state on error
      this.setState({
        todos: update(this.state.todos, {
          [pos]: { done: { $set: todo.done } }
        })
      })

      alert('Todo deletion failed')
    }
  }

  isImageExist = (imageUrl: string | undefined) => {
    if (!imageUrl)
      return false

    const http = new XMLHttpRequest()

    http.open('HEAD', imageUrl, false)
    http.send()

    return http.status == 200;
  }

  async componentDidMount() {
    try {
      const todos = await getTodos(this.props.auth.getIdToken())

      this.setState({
        todos,
        loadingTodos: false
      })
    } catch (e) {
      alert(`Failed to fetch todos: ${e.message}`)
    }
  }

  triggerAddImageModal = (action: boolean) => {
    this.setState({ addImageModalOpen: action})
  }

  renderAddImageModal = (todoId: string) => {
    return (
      <Modal trigger={
        <Button
          icon
          color="blue"
          onClick={() => this.triggerAddImageModal(true)}
        >
          <Icon name="camera" />
        </Button>
      } closeIcon open={this.state.addImageModalOpen} onClose={() => this.triggerAddImageModal(false)}>
        <Modal.Content>
          <EditTodo
            todoId={todoId}
            auth={this.props.auth}
            history={this.props.history}
            closeAddImageModal={() => this.triggerAddImageModal(false)}
          />
        </Modal.Content>
      </Modal>
    )
  }

  render() {
    return (
      <div>
        <div style={{ marginTop: 50 }}>
          <h3>Add Todo</h3>
          {this.renderCreateTodoInput()}
        </div>

        <div style={{ marginTop: 50 }}>
          <h3>Your ToDos</h3>
          {this.renderTodos()}
        </div>
      </div>
    )
  }

  renderCreateTodoInput() {
    return (
      <Grid.Row>
        <Grid.Column width={16}>
          <Input
            action={{
              color: 'teal',
              icon: 'add',
              loading: this.state.addingTodo,
              onClick: this.onTodoCreate
            }}
            fluid
            placeholder="To heal the world ~"
            value={this.state.newTodoName}
            onChange={this.handleNameChange}
          />
        </Grid.Column>
      </Grid.Row>
    )
  }

  renderTodos() {
    if (this.state.loadingTodos) {
      return this.renderLoading()
    }

    return this.renderTodosList()
  }

  renderLoading() {
    return (
      <Grid.Row>
        <Loader indeterminate active inline="centered">
          Loading TODOs
        </Loader>
      </Grid.Row>
    )
  }

  renderTodosList() {
    if (this.state.todos.length < 1) {
      return <Grid padded>
        <Grid.Row>
          <Grid.Column>
            You don't have any ToDo.
          </Grid.Column>
        </Grid.Row>
      </Grid>
    }

    return (
      <Grid padded>
        <Grid.Row>
          <Grid.Column width={1} verticalAlign="middle">
            <strong>Done</strong>
          </Grid.Column>
          <Grid.Column width={10} verticalAlign="middle">
            <strong>Item</strong>
          </Grid.Column>
        </Grid.Row>
        {this.state.todos.map((todo, pos) => {
          return (
            <Grid.Row key={todo.todoId}>
              <Grid.Column width={1} verticalAlign="middle">
                <Checkbox
                  onChange={() => this.onTodoCheck(pos)}
                  checked={todo.done}
                />
              </Grid.Column>
              <Grid.Column width={10} verticalAlign="middle">
                {todo.name}
              </Grid.Column>
              <Grid.Column width={2} verticalAlign="middle" textAlign="right" floated="right">
                {this.renderAddImageModal(todo.todoId)}
                <Button
                  icon
                  color="red"
                  onClick={() => this.onTodoDelete(todo.todoId)}
                >
                  <Icon name="delete" />
                </Button>
              </Grid.Column>
              {this.isImageExist(todo.attachmentUrl) && (
                <Grid.Column width={16} verticalAlign="middle">
                    <Image src={todo.attachmentUrl} />
                </Grid.Column>
              )}
              <Grid.Column width={16}>
                <Divider />
              </Grid.Column>
            </Grid.Row>
          )
        })}
      </Grid>
    )
  }

  calculateDueDate(): string {
    const date = new Date()
    date.setDate(date.getDate() + 7)

    return dateFormat(date, 'yyyy-mm-dd') as string
  }
}
