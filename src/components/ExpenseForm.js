import { getDatabase, ref, set as firebaseSet, push as firebasePush, onValue} from "firebase/database";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button, ButtonGroup, Form, FormGroup, FormText, Input, InputGroup, InputGroupText, Label, Table } from "reactstrap";

function ExpenseForm({ user, edit = false }) {
    const {itemId: id} = useParams();

    const blankItem = {
        buyerID: user.uid,
        date: '',
        description: '',
        items: [{name:'', cost:'', payerIDs:[user.uid]}],
        receipt: '',
        type: 'single'
    }


    useEffect(() => {
        const db = getDatabase();
        var unregisterFunction = () => {};
        if (edit) {
            const expenseRef = ref(db, 'expenses/'+id);
            unregisterFunction = onValue(expenseRef, (snapshot) => {
                setData(snapshot.val());
            })
        } 
        

        function cleanup() {
            unregisterFunction();
        }
        return cleanup
    }, []);

    const [data, setData] = useState(blankItem);
    const type = data.type;

    const [formValid, setFormValid] = useState(false);

    
    useEffect(() => {
        const inputValArr = document.querySelectorAll('.is-invalid');
        setFormValid(inputValArr.length === 0);
    });
    
   

    function handleInput(e) {
        const { name, value } = e.target;
        var items = data.items;

        if (type === 'single' && name === 'description') {
            items[0]['name'] = value;
        }

        if (name === 'type' && value === 'grocery' && type === 'single') {
            items[0]['name'] = '';
        }

        if (name === 'cost') {
            value = value.toFixed(2);
            e.target.value = value;
        }

        setData((prev) => ({
            ...prev, 
            items: items,
            [name]: value
        }));
    }

    function handleItemInput(e) {
        const { name, value } = e.target;
        var arr = data.items;
        arr[e.target.getAttribute('listnum')-1][name] = value;
        setData((prev) => ({
            ...prev, 
            items: arr
        }));
    }

    function addNewItem() {
        var arr = data.items;
        arr = [...arr, {name:'', cost:'', payerIDs:[user.uid]}];
        setData((prev) => ({
            ...prev, 
            items: arr
        }));
    }

    function removeItem(i) {
        var arr = data.items;
        arr.splice(i, 1);
        setData((prev) => ({
            ...prev, 
            items: arr
        }));
    }

    const items = data.items.map((item, i) => 
                            <ItemInput
                                data={item} 
                                listnum={i+1} 
                                removeCB={() => removeItem(i)} 
                                handleChangeCB={handleItemInput}/>);

    
    const navigate = useNavigate();

    function handleSubmit() {
        const db = getDatabase();
        const expenseRef = ref(db, 'expenses');
        const editExpenseRef = ref(db, 'expenses/'+id);
       
        if (edit) {
            firebaseSet(editExpenseRef, data)
            .then(navigate(-1));
        } else {
            firebasePush(expenseRef, data)
            .then(navigate(-1));
        }
    }

    return  (
        <div className="page">
            <h2>New Expense</h2>
            

            <Form className="p-2">
                <ButtonGroup>
                    <Button
                        outline
                        name='type'
                        onClick={handleInput}
                        active={type === 'single'}
                        value='single'
                        >
                        Single
                    </Button>
                    <Button
                        outline
                        name='type'
                        onClick={handleInput}
                        active={type === 'grocery'}
                        value='grocery'
                        >
                        Grocery
                    </Button>
                </ButtonGroup>
                <InputGroup className="desc-input">
                    <InputGroupText>
                        Description
                    </InputGroupText>
                    <Input name='description'
                           onChange={handleInput}
                           value={data.description}
                           invalid={data.description === ''}/>  
                </InputGroup>
    
                <InputGroup className="date-input">
                    <InputGroupText>
                        Date
                    </InputGroupText>
                    <Input  name="date"
                            type='date' onChange={handleInput}
                            value={data.date}
                            invalid={data.date === ''}/>  
                </InputGroup>
    
                <FormGroup>
                    <Label for="receipt">
                        <strong>Receipt</strong>
                    </Label>
                    <Input
                        id="receipt"
                        name="file"
                        type="file"
                        accept="image/png, image/jpeg"
                        onChange={handleInput}
                        />
                    <FormText>
                        Upload a clear image of your receipt if you have it for Jasmine's taxes 
                        <br />
                        Must be png or jpeg file.
                    </FormText>
                </FormGroup>
                {type === 'single' ?
                    <InputGroup className="single-cost-input">
                        <InputGroupText>
                            $
                        </InputGroupText>
                        <Input type="number"
                                placeholder="0.00"
                                name='cost'
                                listnum={1}
                                value={data.items[0].cost}
                                step=".1"
                                onChange={handleItemInput}
                                invalid={data.items[0].cost === ''}/>
                    </InputGroup>
                    :
                    <GroceryItemForm items={items} addNewItem={addNewItem} />
                }

                <Button onClick={handleSubmit}
                        disabled={!formValid}>
                            Submit
                </Button>
            </Form>
            
        </div>
       
    )
}

function GroceryItemForm({ items, addNewItem }) {
    return (
        <div className="grocery-item-form">
            <h3>Grocery Items</h3>
            <Table>
                <thead><tr>
                    <th className="text-center">
                        #
                    </th>
                    <th>
                        Item
                    </th>
                    <th>
                        Total Cost
                    </th>
                    <th></th>
                </tr></thead>
                {items}
            </Table>
            <Button block
                    onClick={addNewItem}>+</Button>
        </div>
    )
}

function ItemInput({ data, listnum, removeCB, handleChangeCB }) {
    return (
        <tr className="">
            <td className='col-1 text-center'>{listnum}</td>
            <td>
                <Input  placeholder="Item Name"
                        name='name'
                        listnum={listnum}
                        value={data.name} 
                        onChange={handleChangeCB}
                        invalid={data.name === ''}/>
            </td>
            <td>
                <InputGroup>
                    <InputGroupText>
                        $
                    </InputGroupText>
                    <Input type='number'
                            placeholder="0.00"
                            listnum={listnum}
                            name='cost'
                            value={data.cost}
                            onChange={handleChangeCB}
                            invalid={data.cost === ''}/>
                </InputGroup>
            </td>
            <td>
                <Button onClick={() => removeCB(listnum-1)}>-</Button>
            </td>
        </tr>
    )
}

export default ExpenseForm;