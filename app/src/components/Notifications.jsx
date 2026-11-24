import { Toast, ToastContainer } from "react-bootstrap";
import { useDispatch, useSelector } from "react-redux";
import { notificationDismissed, selectNotifications } from "../store/notificationsSlice";

const Notifications = () => {
    const notifications = useSelector(selectNotifications);
    const dispatch = useDispatch();

    return (
        <ToastContainer position="bottom-end" className="position-fixed p-3">
            {
                notifications.map(({ id, message }) => (
                    <Toast
                        key={id}
                        autohide
                        delay={4000}
                        onClose={() => dispatch(notificationDismissed(id))}
                    >
                        <Toast.Header>
                            <strong className="me-auto">CSIS279</strong>
                        </Toast.Header>
                        <Toast.Body>{message}</Toast.Body>
                    </Toast>
                ))
            }
        </ToastContainer>
    )
}

export default Notifications;
