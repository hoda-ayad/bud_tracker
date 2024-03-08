import { getDatabase, onValue, ref } from "firebase/database";
import { useEffect, useState } from "react";
import { Badge } from "reactstrap";

export function ProfileMiniView({ id }) {
    const [user, setUser] = useState({});

    useEffect(() => {
        const db = getDatabase();
        const userRef = ref(db, 'users/'+id);

        const unregisterFunction = onValue(userRef, (snapshot) => {
            const obj = snapshot.val();
            setUser(obj);
        });

        function cleanup() {
            unregisterFunction();
        }
        return cleanup;
    }, [id]);

    if (user === null) {
        return <div>Loading...</div>;
    }

    const { fName = '', lName = ''} = user;
    const { firstN = '', lastN = ''} = user;

    return (
       <Badge>
            <div className="prof-pic"></div>
            <div>{fName || firstN}</div>
       </Badge>
    )
}

export function ProfileListView({ ids }) {
    const payerElems = ids.map((item, i, arr) => {
        const elem = <ProfileMiniView id={item} />
        return i < arr.length-1 ? [elem, ', ']: elem;
    })

    return <div>{ids.includes('null') ? 'None': payerElems}</div>;
}