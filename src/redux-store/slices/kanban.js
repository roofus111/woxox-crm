// Third-party Imports
import { createSlice } from '@reduxjs/toolkit'

// Data Imports
import { db } from '@/fake-db/apps/kanban'

export const kanbanSlice = createSlice({
    name: 'kanban',
    initialState: {
        columns: [
            {
                id: 1,
                title: 'Pending',
                taskIds: [1]
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
        tasks: [{
            id: 1,
            title: 'Research FAQ page UX',
            badgeText: ['UX'],
            attachments: 4,
            comments: 12,
            assigned: [
                { src: '/images/avatars/1.png', name: 'John Doe' },
                { src: '/images/avatars/2.png', name: 'Jane Smith' },
                { src: '/images/avatars/3.png', name: 'Robert Johnson' }
            ],
            dueDate: new Date(new Date().getFullYear(), 11, 30)
        }],
    },
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
            state.columns = action.payload
        },
        updateColumnTaskIds: (state, action) => {
            const { id, tasksList } = action.payload

            state.columns = state.columns.map(column => {
                if (column.id === id) {
                    return { ...column, taskIds: tasksList.map(task => task.id) }
                }

                return column
            })
        },
        addTask: (state, action) => {
            const { columnId, title } = action.payload
            // console.log(columnId, title);

            const newTask = {
                id: state.tasks[state.tasks.length - 1].id + 1,
                title: 'Research FAQ page UX',
                badgeText: ['UX'],
                attachments: 4,
                comments: 12,
                assigned: [
                    { src: '/images/avatars/1.png', name: 'John Doe' },
                    { src: '/images/avatars/2.png', name: 'Jane Smith' },
                    { src: '/images/avatars/3.png', name: 'Robert Johnson' }
                ],
                dueDate: new Date(new Date().getFullYear(), 11, 30)
            }
            console.log(newTask);

            const column = state.columns.find(column => column.id === columnId)


            if (column) {
                console.log("column");
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
