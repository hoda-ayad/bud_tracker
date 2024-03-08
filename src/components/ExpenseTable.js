import { Badge, Dropdown, DropdownItem, DropdownMenu, DropdownToggle, Row, Table, UncontrolledButtonDropdown } from "reactstrap";
import _, { toUpper } from 'lodash';
import { useEffect, useState } from "react";
import { ref, onValue, getDatabase } from "firebase/database";
import { ProfileMiniView } from "./Profile";
import { Link, useNavigate } from "react-router-dom";

function getMonthYear(dateStr) {
    const date = new Date(dateStr);
    const x = new Date(date.getFullYear(), date.getMonth());
    return x.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
}

function getMyExpenseTotal(user, item) {
    return Array.from(item.items).reduce((total, elem) => {
        if (elem['payerIDs'].includes(user.uid)) {
            total += elem.cost / elem['payerIDs'].length;
        }
        return total;
    }, 0);
}

function ExpenseTable(props) {
    const [expenses, setExpenses] = useState({});
    const [month, setMonth] = useState(getMonthYear(new Date()));

    useEffect(() => {
        const db = getDatabase();
        const expensesRef = ref(db, 'expenses');

        const unregisterFunction = onValue(expensesRef, (snapshot) => {
            const expenseList = snapshot.val();
            setExpenses(expenseList);
        })

        function cleanup() {
            unregisterFunction();
        }
        return cleanup
    });

    const expensesArray = Object.entries(expenses).map(
        ([key, value]) => ({ id: key, ...value }));

    const sortedData = _.reverse(_.sortBy(expensesArray, 'date'));

    const monthOptions = Array.from(sortedData.reduce((months, item) => {
        const monthYear = getMonthYear(item.date);
        if (!months.has(monthYear)) {
            months.add(monthYear);
        }
        return months;
    }, new Set([])))


    var displayedData = sortedData.filter((item) => {
        return getMonthYear(item.date) === month;
    })

    if (props.userFilter) {
        displayedData = displayedData.filter((exp) => {
            const payerIDs = Array.from(exp.items).map((item) => item.payerIDs);
            return payerIDs.reduce((check, arr) => {
                return arr.includes(props.user.uid) || check;
            }, false)
            
        })
    }
    
    function handleChangeMonth(val) {
        setMonth(val);
        if (props.setMonthCB !== undefined) {
            props.setMonthCB(month)
            props.setDataCB(displayedData);
        }
    }

    useEffect(() => {
        if (props.setMonthCB !== undefined) {
            props.setMonthCB(month)
            props.setDataCB(displayedData);
        }});
  
    var expenseRows = displayedData.map((item) => <ExpenseRow item={item} user={props.user}/>)
    return (
        <div className="page">
            <Row className="px-2">
                <h3 className="col">{props.userFilter ? 'Recent' : ''} Expenses -  
                    {<MonthSelector monthOptions={monthOptions} 
                                    setMonthCB={handleChangeMonth}/>}
                </h3>
                <Link to='/expense-form' className="btn btn-primary col-1">+</Link>
            </Row>
            <Table hover>
                <thead>
                   <tr>
                        <th className="col-1">
                            Date
                        </th>
                        <th>
                           Expense
                        </th>
                        <th>
                            My Total
                        </th>
                        <th>
                            Buyer
                        </th>
                   </tr>
                </thead>
                <tbody>
                    {expenseRows}
                </tbody>
            </Table>
        </div>
    );
}

function ExpenseRow({ item, user }) {
    const navigate = useNavigate();

    const { date, description, type, buyerID } = item ;

    const myTotal = getMyExpenseTotal(user, item);

    function handleRowSelect(e) {
        navigate(`/expense-view/${item.id}`);
    }
    
    return (
        <tr onClick={handleRowSelect}>
            <td >{date}</td>
            <td>{description}</td>
            <td>${(myTotal).toFixed(2)}</td>
            <td><ProfileMiniView id={buyerID} /></td>
        </tr>
    )
}

function MonthSelector(props) {
    const [month, setMonth] = useState((getMonthYear(new Date())));
    const [isOpen, setIsOpen] = useState(false);

    function handleSelect(e) {
        setMonth(e.target.value);
        props.setMonthCB(e.target.value);
    }

    const optionElems = props.monthOptions.map((monthDate) => {
        return <DropdownItem value={monthDate}
                             onClick={handleSelect}>
                        {monthDate}</DropdownItem>
    })

    return (
        <UncontrolledButtonDropdown toggle={function noRefCheck(){}} onChange={handleSelect} className="col px-2">
            <Dropdown isOpen={isOpen} toggle={() => setIsOpen(!isOpen)}>
                <DropdownToggle caret>{month}</DropdownToggle>
                <DropdownMenu>{optionElems}</DropdownMenu>
            </Dropdown>
        </UncontrolledButtonDropdown>
    )
}

export default ExpenseTable;