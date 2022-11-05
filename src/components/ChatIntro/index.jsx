import React from "react";
import "./styles.css";

export default function ChatIntro() {
	return (
    <div className="chatIntro">
      <img src="/assets/chatIntroIcon.jpg" alt="Chat Intro Image" />
      <h1>Mantenha seu celular conectado</h1>
      <h2>
        O WhatsApp conecta ao seu telefone para sincronizar suas mensagens. 
        <br /> 
        Para reduzir o uso de dados, conecte seu telefone a uma rede.
      </h2>
    </div>
  );
}
