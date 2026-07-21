import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import io from 'socket.io-client';
import { toast } from 'react-toastify';

export const useSocket = () => {
    const { data: session } = useSession();
    const [socket, setSocket] = useState(null);


    const [alertData, setAlertData] = useState(null);
    const [open, setOpen] = useState(false);
    const [notificationData, setNotificationData] = useState(null);


    // Create socket connection only once when the component mounts
    useEffect(() => {
        const socketInstance = io(process.env.NEXT_PUBLIC_SOCKET_URL, {
            reconnection: true,
            reconnectionDelay: 500,
            reconnectionAttempts: 10
        });

        socketInstance.on('connect', () => {
            console.log('Connected to server');
            // Only register if we have a user ID
            if (session?.user?.id) {
                socketInstance.emit('register', session.user.id);
            }
        });
        socketInstance.on('welcome', function (data) {
            toast(data.message);
        });

        socketInstance.on('followUpAlert', function (data) {
            setAlertData(data);
            setOpen(true);
            console.log(data);
        });


        socketInstance.on('new_notification', (notification) => {
            setNotificationData(notification)
        });



        socketInstance.on('connect_error', (err) => {
            console.error('Connection failed: ', err);
        });
        setSocket(socketInstance);

        return () => {
            socketInstance.off('connect');
            socketInstance.off('followUpAlert');
            socketInstance.off('welcome');
            socketInstance.off('new_notification');
            socketInstance.off('notification_sent');
            socketInstance.off('connect_error');
            socketInstance.disconnect();
        };
    }, []); // Empty dependency array - only run once

    // Handle user registration separately
    useEffect(() => {
        if (socket && session?.user?.id) {
            socket.emit('register', session.user.id);
        }
    }, [socket, session?.user?.id]);

    return { socket, alertData, open, setOpen, notificationData };
}; 
