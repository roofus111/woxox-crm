'use client'
import { useEffect, useState } from 'react'

// Third-party imports
import { useDragAndDrop } from '@formkit/drag-and-drop/react'
import { animations } from '@formkit/drag-and-drop'
import { useDispatch, useSelector } from 'react-redux'

// Slice Imports
import { addColumn, addTask, updateColumns, fetchTasks } from '@/redux-store/slices/kanban'

// Component Imports
import KanbanList from './KanbanList'
import NewColumn from './NewColumn'
import KanbanDrawer from './KanbanDrawer'

const KanbanBoard = () => {

    const dispatch = useDispatch();
    // const [loading, setLoading] = useState(false);

    useEffect(() => {
        dispatch(fetchTasks());
    }, [dispatch]);

    // const fetchData = async () => {

    //     setLoading(true);

    //     try {
    //         const token = localStorage.getItem('token'); if (!token) {
    //             console.error("Authentication token is missing");
    //             return; // Exit if no token is available
    //         }
<<<<<<< HEAD
    //         const response = await fetch(`https://app.canbridge.in/api/leads/getleadsfordoc`, {
=======
    //         const response = await fetch(`http://13.127.160.185:8000/api/leads/getleadsfordoc`, {
>>>>>>> production
    //             headers: {
    //                 Authorization: `Bearer ${token}`
    //             }
    //         });
    //         if (!response.ok) {
    //             throw new Error(`HTTP error! status: ${response.status}`);
    //         }
    //         const data = await response.json();
    //         const columnId = 2;
    //         // Dispatch actions after all leads are fetched
    //         const tasks = data.leads.map(lead => dispatch(addTask({
    //             columnId,
    //             title: lead._id
    //         })));

    //         await Promise.all(tasks);
    //         // console.log('Dispatched all tasks:', tasks);
    //     } catch (error) {
    //         console.error("Failed to fetch data:", error);
    //     } finally {
    //         setLoading(false);
    //     }
    // };

    // useEffect(() => {
    //     fetchData();

    //     return () => {
    //         console.log("Cleanup if needed");
    //         // Cleanup actions, like cancelling subscriptions or invalidating timers
    //     };
    // }, []); // Ensures this runs only once after the initial render




    // State
    const [drawerOpen, setDrawerOpen] = useState(false)

    // Hooks
    const kanbanStore = useSelector(state => state.kanbanReducer)
    const kanbanColumns = useSelector(state => state.kanbanReducer.columns)
    const loading = useSelector(state => state.kanbanReducer.loading)


    const [boardRef, columns, setColumns] = useDragAndDrop(kanbanColumns, {
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
            {loading ? (
                <p>Loading...</p> // Show loading message or spinner during the loading state
            ) : (
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
            )}
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
