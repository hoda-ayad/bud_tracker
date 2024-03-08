import ExpenseTable from "./components/ExpenseTable";
import { getDatabase, ref, set as firebaseSet } from 'firebase/database'

import { Route, Routes } from "react-router-dom";
import ExpenseView from "./components/ExpenseView";
import ExpensePage from "./pages/ExpensePage";
import ExpenseForm from "./components/ExpenseForm";
import NavBar from "./components/NavBar";
import Authenticator from "./components/Authenticator";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { useEffect, useState } from "react";
import MyExpenses from "./pages/MyExpenses";



function App() {

  const [currUser, setCurrUser] = useState({});

  const db = getDatabase();

  useEffect(() => {
    const auth = getAuth();

    //returns a function that will "unregister" (turn off) the listener
    const unregisterFunction = onAuthStateChanged(auth, (firebaseUser) => {
      //handle user state change
      if(firebaseUser){
        setCurrUser(firebaseUser);
        const userRef = ref(db, 'users/'+firebaseUser.uid);
        firebaseSet(userRef, {
          'email': firebaseUser.email,
          'firstN': firebaseUser.displayName.split(' ')[0],
          'lastN': firebaseUser.displayName.split(' ')[1],
          
        })
      }
    })

    //cleanup function for when component is removed
    function cleanup() {
      unregisterFunction(); //call the unregister function
    }
    return cleanup; //effect hook callback returns the cleanup function
  })

  function signOut(){
    setCurrUser({});
  }

  return (
    <div className="App">
      <NavBar userName={currUser.displayName} signOutCB={signOut}/>
      <Routes>
          <Route path='/' element={<Authenticator />}>
            <Route index element={<ExpenseTable user={currUser}/>} />
            <Route path='expense-form' > 
              <Route index element={<ExpenseForm user={currUser}/>} />
              <Route path=':itemId' element={<ExpenseForm user={currUser} edit={true}/>} />
            </Route>
            <Route path='expense-view' element={<ExpensePage />}>
              <Route path=':id' element={<ExpenseView user={currUser}/>} />
            </Route>
            <Route path='my-expenses' element={<MyExpenses user={currUser}/>}/>
          </Route>
      </Routes>

      
    </div>
  );
}

export default App;
