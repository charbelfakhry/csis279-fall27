import { Card } from "react-bootstrap";

const ContactUs = () => {
    return (
        <Card className="shadow-sm mx-auto" style={{ maxWidth: "540px" }}>
            <Card.Body className="text-center p-5">
                <h1 className="h3 mb-3">Contact Us</h1>
                <p className="text-body-secondary mb-2">Have a question? Reach our support team at</p>
                <a href="mailto:support@support.com" className="fs-5">support@support.com</a>
            </Card.Body>
        </Card>
    )
}

export default ContactUs;
