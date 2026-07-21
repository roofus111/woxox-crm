// import React from 'react';
// import { useDraggable } from '@dnd-kit/core';

// export function Draggable({ id, children }) {
//     const { attributes, listeners, setNodeRef, transform } = useDraggable({
//         id,
//     });

//     const style = {
//         transform: transform
//             ? `translate3d(${transform.x}px, ${transform.y}px, 0)`
//             : undefined,
//         padding: '8px 16px',
//         margin: '4px',
//         backgroundColor: '#f0f0f0',
//         borderRadius: '8px',
//         cursor: 'grab',
//         minHeight: '50px',
//         minWidth: '30%',
//         border: '1px solid #c2c1c0',
//         display: 'flex',
//         justifyContent: 'center',
//         alignItems: 'center',
//         margin: '18px',
//         borderRadius: '10px',
//     };

//     return (
//         <div ref={setNodeRef} style={style} {...listeners} {...attributes}>
//             {children}
//         </div>
//     );
// }
