'use client'
import { useEffect, useState } from 'react'

// Third-party imports
import { useDragAndDrop } from '@formkit/drag-and-drop/react'
import { animations } from '@formkit/drag-and-drop'
import { useDispatch, useSelector } from 'react-redux'

// Slice Imports
import { addColumn, addTask, updateColumns } from '@/redux-store/slices/kanban'

// Component Imports
import KanbanList from './KanbanList'
import NewColumn from './NewColumn'
import KanbanDrawer from './KanbanDrawer'

const KanbanBoard = () => {

    const dispatch = useDispatch()
    const fetchData = async () => {
        const token = localStorage.getItem('token')
        const response = await fetch(`http://localhost:8000/api/leads/getleadsfordoc`, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        })
        const data = await response.json()
        const columnId = 1;
        data.leads.map(lead => {
            dispatch(addTask({
                columnId,
                title: lead._id
            }));
        })
    }

    useEffect(() => {
        fetchData()
    }, [])




    // State
    const [drawerOpen, setDrawerOpen] = useState(false)

    // Hooks
    const kanbanStore = useSelector(state => state.kanbanReducer)


    const [boardRef, columns, setColumns] = useDragAndDrop(kanbanStore.columns, {
        plugins: [animations()],
        dragHandle: '.list-handle'
    })

    // Add New Column
    const addNewColumn = title => {
        const maxId = Math.max(...kanbanStore.columns.map(column => column.id))

        dispatch(addColumn(title))
        setColumns([...columns, { id: maxId + 1, title, taskIds: [] }])
    }

    // To get the current task for the drawer
    const currentTask = kanbanStore.tasks.find(task => task.id === kanbanStore.currentTaskId)

    // Update Columns on Drag and Drop
    useEffect(() => {
        if (columns !== kanbanStore.columns) dispatch(updateColumns(columns))
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [columns])

    return (
        <div className='flex items-start gap-6'>
            <div ref={boardRef} className='flex gap-6'>
                {columns.map(column => (
                    <KanbanList
                        key={column.id}
                        dispatch={dispatch}
                        column={column}
                        store={kanbanStore}
                        setDrawerOpen={setDrawerOpen}
                        columns={columns}
                        setColumns={setColumns}
                        currentTask={currentTask}
                        tasks={column.taskIds.map(taskId => kanbanStore.tasks.find(task => task.id === taskId))}
                    />
                ))}
            </div>
            <NewColumn addNewColumn={addNewColumn} />
            {currentTask && (
                <KanbanDrawer
                    task={currentTask}
                    drawerOpen={drawerOpen}
                    setDrawerOpen={setDrawerOpen}
                    dispatch={dispatch}
                    columns={columns}
                    setColumns={setColumns}
                />
            )}
        </div>
    )
}

export default KanbanBoard
