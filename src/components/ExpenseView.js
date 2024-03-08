import { getDatabase, ref, onValue, set as firebaseSet } from "@firebase/database";
import { toUpper } from "lodash";
import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { Badge, Button, ButtonToggle, Table } from "reactstrap";
import { ProfileListView, ProfileMiniView } from "./Profile";


function ExpenseView({ user }) {
    const navigate = useNavigate();
    const blankItem = {
        buyerID: user.uid,
        date: (new Date()).toString,
        description: '',
        items: [{name:'', cost:'', payerIDs:[user.uid]}],
        receipt: '',
        type: 'single'
    }

    const {id: expID} = useParams();
    const [expenseObj, setExpenseObj] = useState(blankItem);

    useEffect(() => {
        const db = getDatabase();
        const expenseRef = ref(db, 'expenses/'+expID);

        const unregisterFunction = onValue(expenseRef, (snapshot) => {
            const obj = snapshot.val();
            setExpenseObj(obj);
        })

        function cleanup() {
            unregisterFunction();
        }
        return cleanup;
    })

    const { type, buyerID, date, description, items, receipt } = expenseObj;
    //console.log('this item literally can\'t be null', items);
    var total = 0;

    const itemList = items.map((i, index) => {
        const itemCostPer = (i['cost']/(i['payerIDs']).length).toFixed(2);
        if (i['payerIDs'].includes(user.uid)){
            total = total + parseFloat(itemCostPer);
        }

        // const payerElems = i['payerIDs'].map((item, i, arr) => {
        //     const elem = <ProfileMiniView id={item} />
        //     return i < arr.length-1 ? [elem, ', ']: elem;
        // })
        const payerElems = <ProfileListView ids={i['payerIDs']} />;
        
        return <tr>
                <td className="col-3">{i['name']}</td> 
                <td className="col-2">${itemCostPer}</td>
                <td>{<ProfileListView ids={i['payerIDs']} />}</td>
                <td className="col-2 text-center">
                    <OptInSelector user={user} expID={expID} idx={index} items={i['payerIDs']}/>
                </td>
               </tr>;
    });

    return (
        <div className="page">
            <Button role="back" 
                    className="btn-outline-transparent btn-sm"
                    onClick={() => navigate(-1)}>Back</Button>
            {user.uid === buyerID ? <Link to={`/expense-form/${expID}`} className="btn">Edit</Link> 
                                    : null}
            <div className="p-2">
                <h2>{description}</h2>
                <Badge>{toUpper(type)}</Badge>
                <p className="py-2">Buyer: <ProfileMiniView id={buyerID} /></p>
                <div className="pb-1">{date}</div>
                {receipt === "" ? null : <div>Receipt Image</div>}
                <div>Your Total: ${(total).toFixed(2)}</div> 
                {type==='grocery' ? 
                    <div className="item-list p-2">
                        <Table className="w-80">
                            <thead>
                                <tr>
                                    <th>Item</th>
                                    <th>Cost Per</th>
                                    <th>Payers</th>
                                    <th className="text-center">Opt In</th>
                                </tr>
                            </thead>
                            {itemList}
                        </Table>
                    </div> : <div>
                                <p>Paying: <ProfileListView ids={items[0]['payerIDs']}/></p>
                                <OptInSelector user={user} expID={expID} idx={0} items={items[0]['payerIDs']}/>
                            </div> }
            </div>
        </div>
    )
}

function OptInSelector({ user, expID, idx, items }) {

    const [isIn, setIsIn] = useState(items.includes(user.uid));

    function handleClick() {
        setIsIn(!isIn);

        const db = getDatabase();
        const expenseIdsRef = ref(db, 'expenses/'+expID+'/items/'+idx+'/payerIDs');
        var ids = items;
        if (isIn) {
            ids = ids.filter(item => item !== user.uid);
            if (ids.length === 0) {
                ids = ['null'];
            }
        } else {
            if (ids.includes('null')) {
                ids = [];
            }
            ids.push(user.uid);
        }
        firebaseSet(expenseIdsRef, ids)
    }
    return (
        <ButtonToggle onClick={handleClick}>{isIn ? 'Opt Out' : 'Opt In'}</ButtonToggle>
    )
}

export default ExpenseView;