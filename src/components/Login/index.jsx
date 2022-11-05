import firebase from "../../services/firebase";
import "./styles.css";

export default function Login({ onReceive }) {
	const handleGoogleLogin = async () => {
		const result = await firebase.loginWithGoogle();

		if (result) {
			onReceive(result.user);
		} else {
			alert("Erro!");
		}
	};

	return (
		<div className="login">
			<button onClick={handleGoogleLogin}>
				<svg
					xmlns="http://www.w3.org/2000/svg"
					width="192"
					height="192"
					fill="#ffffff"
					viewBox="0 0 256 256"
				>
					<rect width="256" height="256" fill="none"></rect>
					<path
						d="M128,128h88a88.1,88.1,0,1,1-25.8-62.2"
						fill="none"
						stroke="#ffffff"
						strokeLinecap="round"
						strokeLinejoin="round"
						strokeWidth="24"
					></path>
				</svg>

				Logar com o Google
			</button>
		</div>
	);
}
