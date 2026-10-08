import { Form } from "react-bootstrap";

const Dropdown = ({
    name,
    value,
    onChange,
    options = [],
    valueKey = "id",
    labelKey = "name",
    placeholder = "-- Select --",
    required = false
}) => {
    return (
        <Form.Select
            name={name}
            value={value}
            onChange={onChange}
            required={required}
        >
            <option value="">{placeholder}</option>
            {
                options.map((option) => (
                    <option key={option[valueKey]} value={option[valueKey]}>
                        {option[labelKey]}
                    </option>
                ))
            }
        </Form.Select>
    )
}

export default Dropdown;
