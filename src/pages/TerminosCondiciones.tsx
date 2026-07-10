import { LegalLayout, useLegalContacts } from "@/components/legal/LegalLayout";

export default function TerminosCondiciones() {
  const c = useLegalContacts();
  const email = c.email;
  const phone = c.phone;

  return (
    <LegalLayout
      title="Términos y Condiciones"
      lastUpdated="09 de junio de 2026"
      description="Términos y Condiciones de Asesores Migratorios: alcance del servicio, pagos, obligaciones, reembolsos y limitación de responsabilidad."
      canonical="/terminos-y-condiciones"
    >
      <p>
        Los presentes Términos y Condiciones regulan el uso del sitio web, formularios, medios digitales y servicios
        ofrecidos bajo el nombre comercial <strong>Asesores Migratorios</strong>, operado por{" "}
        <strong>{c.legalName}</strong>, con domicilio en <strong>{c.address}</strong>, correo electrónico{" "}
        <strong>{email}</strong> y teléfono/WhatsApp <strong>{phone}</strong>.
      </p>
      <p>
        Al utilizar nuestro sitio web, enviar formularios, solicitar información, contratar un servicio o realizar un
        pago, usted acepta estos Términos y Condiciones.
      </p>

      <Section title="1. Naturaleza de nuestros servicios">
        <p>
          Asesores Migratorios ofrece servicios de asesoría, orientación, apoyo documental, revisión de requisitos,
          llenado de formularios, organización de expedientes, seguimiento administrativo y acompañamiento en
          trámites migratorios, documentales y relacionados.
        </p>
        <p>Nuestros servicios pueden incluir, según el caso:</p>
        <ul className="list-disc pl-6 space-y-1">
          <li>Llenado de formulario DS-160.</li>
          <li>Orientación para visa B1/B2.</li>
          <li>Apoyo en trámite de pasaporte mexicano.</li>
          <li>Apoyo en trámite de pasaporte americano.</li>
          <li>Aclaraciones y rectificaciones de actas.</li>
          <li>Registros extemporáneos.</li>
          <li>Inscripción de doble nacionalidad.</li>
          <li>Apostilla de documentos.</li>
          <li>Traducciones certificadas.</li>
          <li>Actas en línea.</li>
          <li>Impresión de CURP.</li>
          <li>RFC.</li>
          <li>Constancia de extravío.</li>
          <li>Copias y certificados.</li>
          <li>Otros servicios documentales o administrativos relacionados.</li>
        </ul>
      </Section>

      <Section title="2. No somos autoridad gubernamental">
        <p>
          Asesores Migratorios no es una embajada, consulado, oficina gubernamental, autoridad migratoria ni
          dependencia oficial.
        </p>
        <p>
          Nuestros servicios consisten en asesoría y apoyo administrativo/documental. Las decisiones finales sobre
          aprobación, rechazo, emisión de documentos, citas, tiempos de respuesta, entrevistas, visas, pasaportes o
          cualquier resolución corresponden exclusivamente a las autoridades competentes.
        </p>
        <p>
          Contratar nuestros servicios no garantiza la aprobación de una visa, pasaporte, cita, trámite, formulario,
          registro o resolución favorable.
        </p>
      </Section>

      <Section title="3. Alcance del servicio DS-160">
        <p>El servicio DS-160 tiene un costo base de <strong>$600 MXN</strong>.</p>
        <p>Este servicio incluye:</p>
        <ul className="list-disc pl-6 space-y-1">
          <li>Llenado del formulario DS-160 con base en la información proporcionada por el cliente.</li>
          <li>Revisión y organización de datos necesarios.</li>
          <li>Orientación documental básica.</li>
          <li>Acceso a material de preguntas posibles, cuando el pago haya sido aprobado.</li>
          <li>Apoyo para creación de cita cuando el servicio contratado y la disponibilidad del sistema lo permitan.</li>
        </ul>
        <p>Este servicio <strong>no incluye</strong>:</p>
        <ul className="list-disc pl-6 space-y-1">
          <li>Pago oficial de cita consular.</li>
          <li>Derechos gubernamentales.</li>
          <li>Pago de visa.</li>
          <li>Transporte.</li>
          <li>Hospedaje.</li>
          <li>Gastos personales.</li>
          <li>Traducciones adicionales no contratadas.</li>
          <li>Correcciones derivadas de información falsa, incompleta o incorrecta proporcionada por el cliente.</li>
          <li>Garantía de aprobación de visa.</li>
        </ul>
      </Section>

      <Section title="4. Asesoría adicional de preguntas posibles">
        <p>
          El cliente podrá contratar, de forma opcional, una asesoría en vivo de preguntas posibles por{" "}
          <strong>$200 MXN adicionales</strong>.
        </p>
        <p>Esta asesoría puede incluir orientación sobre:</p>
        <ul className="list-disc pl-6 space-y-1">
          <li>Cómo entender preguntas comunes de entrevista.</li>
          <li>Cómo responder con claridad y coherencia.</li>
          <li>Qué errores evitar.</li>
          <li>Cómo organizar información personal, laboral y de viaje.</li>
          <li>Resolución de dudas generales relacionadas con la entrevista.</li>
        </ul>
        <p>La asesoría no garantiza aprobación de visa ni sustituye el criterio de la autoridad consular.</p>
      </Section>

      <Section title="5. Precios, pagos y confirmación">
        <p>Los precios publicados en el sitio se muestran en pesos mexicanos, salvo que se indique lo contrario.</p>
        <p>
          El pago podrá realizarse mediante las opciones habilitadas en el sitio web, incluyendo Mercado Pago u otros
          métodos disponibles.
        </p>
        <p>
          El servicio se considera contratado únicamente cuando el pago haya sido confirmado correctamente por la
          plataforma de pago correspondiente.
        </p>
        <p>
          Si el pago aparece como pendiente, rechazado, cancelado o en revisión, Asesores Migratorios podrá detener
          el inicio o continuidad del servicio hasta que el pago sea aprobado.
        </p>
        <p>
          Los datos bancarios o de tarjeta son procesados por la plataforma de pago. Asesores Migratorios no almacena
          números completos de tarjeta ni códigos de seguridad.
        </p>
      </Section>

      <Section title="6. Obligaciones del cliente">
        <p>El cliente se obliga a:</p>
        <ul className="list-disc pl-6 space-y-1">
          <li>Proporcionar información real, completa, clara y actualizada.</li>
          <li>Revisar cuidadosamente los datos antes de autorizar el envío, uso o captura de información en formularios.</li>
          <li>Entregar documentos legibles y vigentes cuando sean necesarios.</li>
          <li>Responder oportunamente a solicitudes de información.</li>
          <li>Informar cualquier error, cambio o inconsistencia detectada.</li>
          <li>No proporcionar documentos falsos, alterados o de origen dudoso.</li>
          <li>Cubrir pagos oficiales, derechos gubernamentales o gastos externos cuando correspondan.</li>
          <li>Entender que las decisiones finales dependen de autoridades competentes.</li>
        </ul>
        <p>
          El cliente es responsable de la veracidad de la información que proporciona. Asesores Migratorios no será
          responsable por rechazos, errores, retrasos o consecuencias derivadas de datos falsos, incompletos,
          imprecisos o no actualizados proporcionados por el cliente.
        </p>
      </Section>

      <Section title="7. Revisión y autorización de información">
        <p>
          Antes de enviar, confirmar o utilizar información en un trámite, el cliente podrá ser solicitado para
          revisar y validar sus datos.
        </p>
        <p>
          Cuando el cliente autorice, confirme o proporcione información para continuar el trámite, se entenderá que
          dicha información fue revisada y aceptada por él.
        </p>
        <p>
          Cualquier corrección posterior podrá generar costos adicionales si implica rehacer formularios, modificar
          expedientes, reagendar procesos o realizar trabajo adicional.
        </p>
      </Section>

      <Section title="8. Tiempos de atención">
        <p>Los tiempos de atención pueden variar dependiendo de:</p>
        <ul className="list-disc pl-6 space-y-1">
          <li>Complejidad del trámite.</li>
          <li>Rapidez con la que el cliente entregue información.</li>
          <li>Disponibilidad de citas o plataformas oficiales.</li>
          <li>Horarios de atención.</li>
          <li>Fallas técnicas de portales externos.</li>
          <li>Cambios en requisitos de autoridades.</li>
          <li>Volumen de solicitudes.</li>
        </ul>
        <p>
          Asesores Migratorios procurará brindar seguimiento oportuno, pero no garantiza tiempos de respuesta de
          autoridades, consulados, dependencias gubernamentales o plataformas externas.
        </p>
      </Section>

      <Section title="9. Material de preguntas posibles">
        <p>
          El material de preguntas posibles, guías, PDFs, documentos, recomendaciones o recursos proporcionados al
          cliente son para uso personal del cliente que contrató el servicio.
        </p>
        <p>
          Queda prohibido copiar, revender, distribuir, publicar, compartir masivamente o usar comercialmente dicho
          material sin autorización expresa de Asesores Migratorios.
        </p>
        <p>El acceso a este material podrá estar condicionado a que el pago del servicio correspondiente haya sido aprobado.</p>
      </Section>

      <Section title="10. Cancelaciones y reembolsos">
        <p>La política de cancelaciones y reembolsos busca ser equilibrada para ambas partes.</p>
        <h3 className="font-serif font-bold text-primary mt-4">Puede proceder reembolso total o parcial cuando:</h3>
        <ul className="list-disc pl-6 space-y-1">
          <li>El cliente pagó por error y solicita cancelación antes de que se inicie cualquier revisión, captura, asesoría o gestión.</li>
          <li>El servicio no puede prestarse por causa atribuible directamente a Asesores Migratorios.</li>
          <li>Existe duplicidad comprobable de pago.</li>
        </ul>
        <h3 className="font-serif font-bold text-primary mt-4">No procede reembolso total cuando:</h3>
        <ul className="list-disc pl-6 space-y-1">
          <li>El servicio ya fue iniciado.</li>
          <li>Ya se revisó información o documentación.</li>
          <li>Ya se llenó total o parcialmente un formulario.</li>
          <li>Ya se entregó material, guía, PDF, asesoría o información personalizada.</li>
          <li>Ya se realizó una cita, captura, seguimiento o gestión.</li>
          <li>El cliente proporcionó información incorrecta, falsa, incompleta o tardía.</li>
          <li>La autoridad rechaza, demora, cancela o modifica requisitos del trámite.</li>
          <li>El cliente decide no continuar por razones personales después de iniciado el servicio.</li>
        </ul>
        <p>
          Los pagos oficiales realizados a autoridades, consulados, dependencias, plataformas externas o terceros no
          son reembolsables por Asesores Migratorios, salvo que la autoridad o tercero correspondiente lo permita
          bajo sus propias reglas.
        </p>
        <p>
          Cada solicitud de reembolso será revisada de forma individual y deberá solicitarse por escrito al correo{" "}
          <strong>{email}</strong> o WhatsApp <strong>{phone}</strong>, indicando nombre completo, servicio
          contratado, fecha de pago, comprobante y motivo de la solicitud.
        </p>
      </Section>

      <Section title="11. Limitación de responsabilidad">
        <p>Asesores Migratorios no será responsable por:</p>
        <ul className="list-disc pl-6 space-y-1">
          <li>Rechazo de visas, pasaportes, citas, registros o trámites.</li>
          <li>Cambios en requisitos, costos, reglas o procedimientos de autoridades.</li>
          <li>Fallas, caídas o bloqueos de plataformas oficiales.</li>
          <li>Errores derivados de información proporcionada por el cliente.</li>
          <li>Documentos falsos, alterados, incompletos o ilegibles.</li>
          <li>Retrasos por falta de respuesta del cliente.</li>
          <li>Decisiones tomadas por consulados, embajadas, dependencias, oficiales migratorios o autoridades.</li>
          <li>Gastos personales del cliente, como transporte, hospedaje, alimentos, permisos, impresiones, traslados o pérdidas indirectas.</li>
        </ul>
        <p>Nuestra responsabilidad se limita al servicio de asesoría, apoyo documental, orientación y seguimiento contratado.</p>
      </Section>

      <Section title="12. Comunicación con el cliente">
        <p>La comunicación podrá realizarse mediante:</p>
        <ul className="list-disc pl-6 space-y-1">
          <li>WhatsApp.</li>
          <li>Teléfono.</li>
          <li>Correo electrónico.</li>
          <li>Formularios del sitio web.</li>
          <li>Panel de usuario.</li>
          <li>Redes sociales oficiales.</li>
          <li>Otros medios digitales autorizados.</li>
        </ul>
        <p>
          El cliente acepta que estos medios podrán utilizarse para dar seguimiento al servicio, solicitar
          información, enviar actualizaciones, confirmar pagos, entregar documentos o resolver dudas.
        </p>
      </Section>

      <Section title="13. Uso correcto del sitio">
        <p>El usuario se compromete a no utilizar el sitio web para:</p>
        <ul className="list-disc pl-6 space-y-1">
          <li>Enviar información falsa.</li>
          <li>Suplantar identidades.</li>
          <li>Cargar documentos alterados o ilegales.</li>
          <li>Intentar acceder a cuentas o información de terceros.</li>
          <li>Manipular formularios, pagos o sistemas.</li>
          <li>Copiar contenido, diseño, textos, materiales o documentos sin autorización.</li>
          <li>Realizar actividades contrarias a la ley o a estos términos.</li>
        </ul>
        <p>
          Asesores Migratorios podrá suspender el acceso o rechazar la prestación del servicio cuando detecte uso
          indebido, información falsa, conducta abusiva o riesgo legal.
        </p>
      </Section>

      <Section title="14. Propiedad intelectual">
        <p>
          Los textos, materiales, formularios, guías, PDFs, imágenes, estructura, diseño, marca, contenido y recursos
          publicados en el sitio pertenecen a Asesores Migratorios o se utilizan con autorización.
        </p>
        <p>El cliente no adquiere derechos de propiedad sobre dichos materiales por contratar un servicio.</p>
      </Section>

      <Section title="15. Modificaciones a los servicios o términos">
        <p>
          Asesores Migratorios podrá modificar precios, servicios, contenidos, políticas, formularios o estos
          Términos y Condiciones cuando existan razones operativas, legales, comerciales o técnicas.
        </p>
        <p>
          Los cambios serán publicados en esta misma sección del sitio web. Las contrataciones realizadas antes de
          un cambio se regirán por las condiciones vigentes al momento del pago, salvo que el cambio beneficie al
          cliente o sea legalmente obligatorio.
        </p>
      </Section>

      <Section title="16. Protección de datos personales">
        <p>El tratamiento de datos personales se realizará conforme al Aviso de Privacidad disponible en el sitio web.</p>
        <p>Al proporcionar información o contratar un servicio, el cliente reconoce haber leído dicho Aviso de Privacidad.</p>
      </Section>

      <Section title="17. Contacto, aclaraciones y quejas">
        <p>Para dudas, aclaraciones, solicitudes o quejas relacionadas con el servicio, puede contactarnos en:</p>
        <ul className="list-none pl-0 space-y-1">
          <li><strong>Nombre comercial:</strong> Asesores Migratorios</li>
          <li><strong>Responsable:</strong> {c.legalName}</li>
          <li><strong>Correo:</strong> {email}</li>
          <li><strong>Teléfono/WhatsApp:</strong> {phone}</li>
          <li><strong>Domicilio de atención:</strong> {c.address}</li>
        </ul>
      </Section>

      <Section title="18. Aceptación">
        <p>
          Al utilizar el sitio, enviar formularios, proporcionar documentos, solicitar asesoría o realizar un pago,
          el cliente declara que ha leído, entendido y aceptado estos Términos y Condiciones.
        </p>
      </Section>
    </LegalLayout>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="space-y-3 pt-4 border-t border-border first:border-t-0 first:pt-0">
      <h2 className="font-serif text-xl sm:text-2xl font-bold text-primary">{title}</h2>
      {children}
    </section>
  );
}
