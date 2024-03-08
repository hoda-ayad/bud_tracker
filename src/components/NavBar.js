import { getAuth, signOut } from "firebase/auth";
import { set } from "lodash";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Collapse, Nav, NavItem, NavLink, Navbar, NavbarText, NavbarToggler } from "reactstrap";

function NavBar({ userName, signOutCB }) {
    const navigate = useNavigate();
    const [isOpen, setIsOpen] = useState();

    function handleSignOut() {
        const auth = getAuth();
        console.log('signing out');
        signOut(auth)
            .then(() => {
                console.log("Signed out");
                signOutCB();
                navigate('/');
            })
            .catch(err => console.log(err));
        
    }

    function toggle() {
        setIsOpen(!isOpen);
    }

    return (
        userName !== undefined ?
        <Navbar>
            <NavbarToggler onClick={toggle}/>
            <Collapse isOpen={isOpen}>
                <Nav>
                    <NavItem>
                        <NavLink href='/expense-form'>Add New Expense</NavLink>
                    </NavItem>
                    <NavItem>
                        <NavLink href='/'>See All Expenses</NavLink>
                    </NavItem>
                    <NavItem>
                        <NavLink href='/my-expenses'>My Expenses</NavLink>
                    </NavItem>
                </Nav>
            </Collapse>
                
                                <NavbarText>
                                    hi {userName.split(' ')[0]} :)
                                    <div onClick={handleSignOut} className="btn">Sign Out</div>
                                </NavbarText> 
                                
                
                
                
                
        </Navbar> : <Navbar><Nav><NavbarText>Welcome!</NavbarText></Nav></Navbar>
    )
}

export default NavBar;