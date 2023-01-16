import { useState } from "react"

function Dropdown({ dropdownName, dropdownItems, onSelected, defaultValue }) {

    const [currentItem, setCurrentItem] = useState(defaultValue)

    const changeCurrentItem = (newItem) => {
        if (newItem === currentItem) return
        setCurrentItem(newItem)
        onSelected(newItem)
    }

    return (
        <div className="dropdown m-2">
            <label className="me-1 text-muted">{dropdownName} </label>
                
            <button className="btn dropdown-toggle btn-outline-dark shadow-none" type="button" data-bs-toggle="dropdown">
                {currentItem}
            </button>
            <ul className="dropdown-menu" aria-labelledby="dropdownMenuButton1">
                { dropdownItems.map((dropdownItem, index) => { return <li key={index} onClick={ () => changeCurrentItem(dropdownItem) }><a className="dropdown-item">{ dropdownItem }</a></li> }) }
            </ul>
        </div>
    )
}

export default Dropdown