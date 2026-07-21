// import React from 'react';
// import { useDroppable } from '@dnd-kit/core';

// export function Droppable({ id, children }) {
//     const { setNodeRef } = useDroppable({
//         id,
//     });

//     const style = {
//         minHeight: '150px',
//         minWidth: '100px',
//         width: '50%',
//         height: '450px',
//         border: '1px solid #dcdee0',
//         display: 'flex',
//         flexDirection: 'column',
//         justifyContent: 'flex-start',
//         alignItems: 'center',
//         margin: '8px',
//         padding: '8px',
//         backgroundColor: '#fff',
//         borderRadius: '8px',
//     };

//     const headingStyle = {
//         fontSize: '28px',
//         fontWeight: 'bold',
//         marginBottom: '16px',
//     };

//     // Render unique heading based on the container id
//     const getHeading = (id) => {
//         switch (id) {
//             case 'A':
//                 return 'One';
//             case 'B':
//                 return 'Two';
//             case 'C':
//                 return 'Three';
//             default:
//                 return 'Droppable Container';
//         }
//     };

//     return (
//         <div ref={setNodeRef} style={style}>
//             <div style={headingStyle}>{getHeading(id)}</div>
//             {children}
//         </div>
//     );
// }
