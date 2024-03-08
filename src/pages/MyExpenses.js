import { Table } from "reactstrap";
import ExpenseTable from "../components/ExpenseTable";
import { useEffect, useState } from "react";
import { getDatabase, onValue, ref } from "firebase/database";

function getMyExpenseTotal(user, item) {
    return Array.from(item.items).reduce((total, elem) => {
        if (elem['payerIDs'].includes(user.uid)) {
            total += elem.cost / elem['payerIDs'].length;
        }
        return total;
    }, 0);
}

function getOwedToUser(payer, buyerID, data) {
    return data.reduce((total, exp) => {
        if (exp.buyerID === buyerID) {
            total += getMyExpenseTotal(payer, exp);
        }
        return total;
    }, 0)
}

function MyExpenses({ user }) {
    const [month, setMonth] = useState();
    const [data, setData] = useState();
    const [userList, setUserList] = useState({});
    
    useEffect(() => {
        const db = getDatabase();
        const usersRef = ref(db, 'users');

        const unregisterFunction = onValue(usersRef, (snapshot) => {
            const users = snapshot.val();
            setUserList(users);
        })

        function cleanup() {
            unregisterFunction();
        }
        return cleanup
        
    }, [])

    return (
        <div className="page">
            <h2>My Expenses Breakdown - {month}</h2>
            <OwedTable userList={userList} data={data} currUser={user}/>
            <ExpenseTable user={user} 
                          userFilter 
                          setMonthCB={(val) => setMonth(val)}
                          setDataCB={(val) => setData(val)}/>
        </div>
    )
}

function OwedTable({ userList, data, currUser }) {
    const rows = Object.entries(userList).map((elem) => {
        const [key, value] = elem;
        const amt = getOwedToUser(currUser, key, data);
        if (amt > 0 && key !== currUser.uid) {
            return <tr><td>{value.fName || value.firstN}</td><td>${amt.toFixed(2)}</td></tr>;
        }
    })
    
    return (
        <Table striped size="sm" className="w-50">
            <thead>
                <tr>
                    <th className="col-3">Buyer</th>
                    <th>You Owe</th>
                </tr>
            </thead>
            <tbody>{!rows.every(item => item === undefined) ? rows : <tr><td>You Owe Nothing!</td><td></td></tr>}</tbody>
        </Table>
    )
}

export default MyExpenses;