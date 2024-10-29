import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'

// Define the async thunk for fetching tasks
export const fetchInitialData = createAsyncThunk('kanban/fetchInitialData', async () => {
  const token = localStorage.getItem('token')
  const response = await fetch(`https://app.canbridge.in/api/leads/getleadsfordoc`, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  })
  const data = await response.json()
  // console.log('DOC-', data)

  return data.leads
})

const init = {
  columns: [
    {
      id: 1,
      title: 'Pending',
      taskIds: []
    },
    {
      id: 2,
      title: 'In Review',
      taskIds: []
    },
    {
      id: 3,
      title: 'Pending Documents',
      taskIds: []
    },
    {
      id: 4,
      title: 'Documents Collected',
      taskIds: []
    },
    {
      id: 5,
      title: 'Application Submitted',
      taskIds: []
    },
    {
      id: 6,
      title: 'Interview Scheduled',
      taskIds: []
    },
    {
      id: 7,
      title: 'Offer Letter Received',
      taskIds: []
    },
    {
      id: 8,
      title: 'Offer letter Rejected',
      taskIds: []
    },
    {
      id: 9,
      title: 'Visa Documentation',
      taskIds: []
    },
    {
      id: 10,
      title: 'Visa Application Submitted',
      taskIds: []
    },
    {
      id: 11,
      title: 'Visa Approved',
      taskIds: []
    },
    {
      id: 12,
      title: 'Visa Rejected',
      taskIds: []
    }
  ],
  tasks: [],
  lead: []
}

export const kanbanSlice = createSlice({
  name: 'kanban',
  initialState: init,
  reducers: {
    addColumn: (state, action) => {
      const maxId = Math.max(...state.columns.map(column => column.id))

      const newColumn = {
        id: maxId + 1,
        title: action.payload,
        taskIds: []
      }

      state.columns.push(newColumn)
    },
    editColumn: (state, action) => {
      const { id, title } = action.payload
      const column = state.columns.find(column => column.id === id)

      if (column) {
        column.title = title
      }
    },
    deleteColumn: (state, action) => {
      const { columnId } = action.payload
      const column = state.columns.find(column => column.id === columnId)

      state.columns = state.columns.filter(column => column.id !== columnId)

      if (column) {
        state.tasks = state.tasks.filter(task => !column.taskIds.includes(task.id))
      }
    },
    updateColumns: (state, action) => {
      console.log('function triggers');

      state.columns = action.payload
    },
    updateColumnTaskIds: (state, action) => {
      const { id, tasks } = action.payload
      console.log(id, tasks);

      state.columns = state.columns.map(column => {
        if (column.id === id) {
          return { ...column, taskIds: tasks.map(task => task._id) }
        }
        return column
      })
    },
    addTask: (state, action) => {
      const { columnId, title } = action.payload

      const newTask = {
        id: state.tasks[state.tasks.length - 1].id + 1,
        title
      }

      const column = state.columns.find(column => column.id === columnId)

      if (column) {
        column.taskIds.push(newTask.id)
      }

      state.tasks.push(newTask)

      return state
    },
    editTask: (state, action) => {
      const { id, title, badgeText, dueDate } = action.payload
      const task = state.tasks.find(task => task.id === id)

      if (task) {
        task.title = title
        task.badgeText = badgeText
        task.dueDate = dueDate
      }
    },
    deleteTask: (state, action) => {
      const taskId = action.payload

      state.tasks = state.tasks.filter(task => task.id !== taskId)
      state.columns = state.columns.map(column => {
        return {
          ...column,
          taskIds: column.taskIds.filter(id => id !== taskId)
        }
      })
    },
    getCurrentTask: (state, action) => {
      state.currentTaskId = action.payload
    }
  },
  extraReducers: builder => {
    builder
      .addCase(fetchInitialData.pending, state => {
        state.loading = true;
      })
      .addCase(fetchInitialData.fulfilled, (state, action) => {
        state.loading = false;
        const tasks = action.payload || [];  // Ensure payload is always an array
        tasks.forEach(task => {
          const column = state.columns.find(c => c.title === task.status);
          if (column) {
            if (!column.taskIds.includes(task._id)) { // Check for duplicates before pushing
              column.taskIds.push(task._id);
            }
          } else {
            // Optionally handle the case where no column matches the task status
            console.error(`No column found for status: ${task.status}`);
          }
        });

        state.lead = tasks;  // Assuming you want to store all tasks in `state.lead`
      })
      .addCase(fetchInitialData.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Unknown error occurred';  // Fallback error message
      });
  }

})
export const {
  addColumn,
  editColumn,
  deleteColumn,
  updateColumns,
  updateColumnTaskIds,
  addTask,
  editTask,
  deleteTask,
  getCurrentTask
} = kanbanSlice.actions
export default kanbanSlice.reducer
