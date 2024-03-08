import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { useAuthState } from 'react-firebase-hooks/auth';
import { StyledFirebaseAuth } from "react-firebaseui";
import { Outlet } from "react-router-dom";

const firebaseUIConfig = {
    signInOptions: [ //array of sign in options supported
        //array can include just "Provider IDs", or objects with the IDs and options
        GoogleAuthProvider.PROVIDER_ID
    ],
    signInFlow: 'redirect', //don't redirect to authenticate
    credentialHelper: 'none', //don't show the email account chooser
    callbacks: { //"lifecycle" callbacks
        signInSuccessWithAuthResult: () => {
        return true; //don't redirect after authentication
        }
    }
}

function Authenticator({ loggedIn }) {
    const auth = getAuth();
    const [user, loading, error] = useAuthState(auth);

    if(loading){ 
        return <p className='text-center'>Loading...</p>
    }

    if(error) {
        return <p>Error: {error}</p>
    }

    if(user) { 
        return <Outlet />;
    } else {
        return <SignInPage />;
    }

}

function SignInPage() {
    const auth = getAuth();

    return (
        <div>
            <h2 className='text-center pb-5'>Sign In</h2>
            <StyledFirebaseAuth uiConfig={firebaseUIConfig} firebaseAuth={auth} />
        </div>
    )
}

export default Authenticator;