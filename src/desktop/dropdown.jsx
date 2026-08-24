import { useState } from "react"
import RBDropdown from "react-bootstrap/Dropdown";

function Dropdown({ dropdownName, dropdownItems, onSelected, defaultValue }) {

    const [currentItem, setCurrentItem] = useState(defaultValue)

    const changeCurrentItem = (newItem) => {
        if (newItem === currentItem) return
        setCurrentItem(newItem)
        onSelected(newItem)
    }

    return (
        <div className="m-2 d-inline-flex align-items-center">
            <label className="me-1 text-muted">{dropdownName} </label>
            <RBDropdown>
                <RBDropdown.Toggle variant="outline-dark" size="sm" className="shadow-none">
                    {currentItem}
                </RBDropdown.Toggle>
                <RBDropdown.Menu>
                    {dropdownItems.map(dropdownItem => (
                        <RBDropdown.Item
                            key={dropdownItem}
                            onClick={() => changeCurrentItem(dropdownItem)}
                        >
                            {dropdownItem}
                        </RBDropdown.Item>
                    ))}
                </RBDropdown.Menu>
            </RBDropdown>
        </div>
    )
}

export default Dropdown
