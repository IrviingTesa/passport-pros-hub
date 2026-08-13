import { LegalLayout, useLegalContacts } from "@/components/legal/LegalLayout";

export default function AvisoPrivacidad() {
  const c = useLegalContacts();
  const email = c.email;
  const phone = c.phone;

  return (
    <LegalLayout
      title="Aviso de Privacidad"
      lastUpdated="30 de junio de 2026"
      description="Aviso de Privacidad de Asesores Migratorios: datos personales que recabamos, finalidades, transferencias, derechos ARCO y medidas de seguridad."
      canonical="/aviso-de-privacidad"
    >
      <p>
        El presente Aviso de Privacidad corresponde al sitio web y servicios ofrecidos bajo el nombre comercial{" "}
        <strong>Asesores Migratorios</strong>, operado por <strong>{c.legalName}</strong>, con domicilio en{" "}
        <strong>{c.address}</strong>, correo electrónico <strong>{email}</strong> y teléfono/WhatsApp{" "}
        <strong>{phone}</strong>.
      </p>
      <p>
        Para efectos del presente aviso, <strong>Asesores Migratorios</strong> será responsable del tratamiento de
        los datos personales que nos proporcione de forma directa, a través de nuestro sitio web, formularios,
        WhatsApp, correo electrónico, llamadas, redes sociales, panel de usuario o cualquier otro medio de contacto
        relacionado con nuestros servicios.
      </p>

      <Section title="1. Datos personales que podemos recabar">
        <p>Para prestar nuestros servicios, podremos solicitar y tratar los siguientes datos personales:</p>

        <h3 className="font-serif font-bold text-primary mt-4">Datos de identificación</h3>
        <p>
          Nombre completo, fecha de nacimiento, nacionalidad, lugar de nacimiento, sexo, estado civil,
          identificación oficial, CURP, RFC, pasaporte, actas del Registro Civil y demás documentos necesarios para
          el trámite solicitado.
        </p>

        <h3 className="font-serif font-bold text-primary mt-4">Datos de contacto</h3>
        <p>
          Teléfono, WhatsApp, correo electrónico, domicilio, ciudad, estado, país y otros medios de contacto
          proporcionados por usted.
        </p>

        <h3 className="font-serif font-bold text-primary mt-4">Datos laborales y económicos</h3>
        <p>
          Lugar de trabajo, puesto, dirección de la empresa, teléfono de la empresa, fecha de ingreso, sueldo
          mensual aproximado, ocupación y demás información necesaria para formularios o trámites específicos.
        </p>

        <h3 className="font-serif font-bold text-primary mt-4">Datos migratorios y de viaje</h3>
        <p>
          Tipo de trámite solicitado, historial de viajes, fechas aproximadas de viaje, ciudades visitadas, tiempo
          de estancia, información relacionada con visas, pasaportes, citas, formularios migratorios y contacto u
          hospedaje en Estados Unidos u otros países.
        </p>

        <h3 className="font-serif font-bold text-primary mt-4">Datos de terceros proporcionados por usted</h3>
        <p>
          En algunos trámites puede ser necesario proporcionar datos de familiares, contactos en Estados Unidos,
          referencias, contactos de emergencia, hoteles o personas relacionadas con el trámite. Usted manifiesta que
          cuenta con autorización o causa legítima para proporcionarnos dichos datos.
        </p>

        <h3 className="font-serif font-bold text-primary mt-4">Documentos e información adicional</h3>
        <p>
          Podremos recibir archivos, fotografías, documentos escaneados, comprobantes, formularios, constancias,
          recibos, capturas, PDFs o cualquier otro documento necesario para revisar, integrar o dar seguimiento al
          servicio contratado.
        </p>

        <h3 className="font-serif font-bold text-primary mt-4">Datos de pago</h3>
        <p>
          Podremos tratar información relacionada con el monto pagado, fecha de pago, referencia de pago, estado del
          pago, servicio contratado y comprobantes. Los datos bancarios o de tarjeta son procesados directamente por
          la plataforma de pago correspondiente, como Mercado Pago, por lo que Asesores Migratorios no almacena
          números completos de tarjetas bancarias ni códigos de seguridad.
        </p>
      </Section>

      <Section title="2. Finalidades principales del tratamiento">
        <p>Utilizamos sus datos personales para las siguientes finalidades necesarias:</p>
        <ul className="list-disc pl-6 space-y-1">
          <li>Identificarlo y contactarlo.</li>
          <li>Dar respuesta a solicitudes de información.</li>
          <li>Revisar requisitos para trámites migratorios, documentales o administrativos.</li>
          <li>Integrar expedientes y organizar información proporcionada por el cliente.</li>
          <li>Llenar formularios, solicitudes o formatos relacionados con el servicio contratado.</li>
          <li>Dar seguimiento a trámites, citas, pagos, documentos y avances.</li>
          <li>Proporcionar asesoría documental, administrativa o migratoria.</li>
          <li>Crear citas o apoyar en procesos de agenda cuando el servicio contratado lo incluya.</li>
          <li>Entregar documentos, guías, preguntas posibles, confirmaciones o información relacionada con el servicio.</li>
          <li>Confirmar pagos y validar la continuidad del servicio.</li>
          <li>Mantener comunicación por WhatsApp, teléfono, correo electrónico, panel de usuario o medios digitales.</li>
          <li>Cumplir obligaciones legales, fiscales, administrativas o de seguridad.</li>
          <li>Atender aclaraciones, quejas, dudas o solicitudes relacionadas con el servicio.</li>
        </ul>
      </Section>

      <Section title="3. Finalidades secundarias">
        <p>También podremos usar sus datos para las siguientes finalidades no indispensables:</p>
        <ul className="list-disc pl-6 space-y-1">
          <li>Enviar recordatorios, recomendaciones o información complementaria.</li>
          <li>Solicitar opiniones, comentarios o reseñas del servicio.</li>
          <li>Informarle sobre nuevos servicios, promociones o actualizaciones.</li>
          <li>Mejorar nuestros procesos internos, atención al cliente y experiencia en el sitio web.</li>
        </ul>
        <p>
          Si usted no desea que sus datos sean utilizados para finalidades secundarias, podrá solicitarlo enviando un
          mensaje al correo <strong>{email}</strong> o al WhatsApp <strong>{phone}</strong>.
        </p>
      </Section>

      <Section title="4. Datos personales sensibles">
        <p>
          De forma general, no solicitamos datos sensibles salvo que sean estrictamente necesarios para un trámite
          específico o que usted los proporcione voluntariamente por la naturaleza del servicio.
        </p>
        <p>
          Algunos trámites podrían requerir información relacionada con antecedentes personales, familiares,
          migratorios, legales, nacionalidad, salud, religión u otra información delicada, dependiendo de los
          requisitos del formulario o autoridad correspondiente.
        </p>
        <p>
          Cuando sea necesario tratar datos sensibles, se utilizarán únicamente para la finalidad directamente
          relacionada con el servicio solicitado y se manejarán con medidas de seguridad reforzadas.
        </p>
      </Section>

      <Section title="5. Transferencias y terceros">
        <p>
          Sus datos personales podrán ser compartidos únicamente cuando sea necesario para prestar el servicio
          contratado, cumplir obligaciones legales o utilizar herramientas indispensables para operar el sitio.
        </p>
        <p>Podremos compartir información con:</p>
        <ul className="list-disc pl-6 space-y-1">
          <li>Autoridades, portales oficiales, consulados, dependencias gubernamentales o entidades competentes cuando el trámite lo requiera.</li>
          <li>Proveedores tecnológicos de alojamiento web, base de datos, correo electrónico, almacenamiento, seguridad, formularios o administración del sitio.</li>
          <li>Plataformas de pago, como Mercado Pago, para procesar pagos y validar transacciones.</li>
          <li>Personal interno autorizado que participe en la atención, revisión o seguimiento de su servicio.</li>
          <li>Prestadores de servicios relacionados con documentación, traducción, gestión, soporte o atención administrativa, cuando sea necesario.</li>
          <li>Autoridades competentes cuando exista requerimiento legal.</li>
        </ul>
        <p>No vendemos, rentamos ni comercializamos bases de datos de clientes.</p>
      </Section>

      <Section title="6. Medidas de seguridad">
        <p>
          Aplicamos medidas administrativas, técnicas y físicas razonables para proteger sus datos personales contra
          daño, pérdida, alteración, destrucción, uso, acceso o tratamiento no autorizado.
        </p>
        <p>Entre estas medidas se incluyen:</p>
        <ul className="list-disc pl-6 space-y-1">
          <li>Acceso restringido a cuentas administrativas.</li>
          <li>Roles y permisos para usuarios internos.</li>
          <li>Uso de plataformas tecnológicas con medidas de seguridad.</li>
          <li>Control de documentos recibidos.</li>
          <li>Limitación de acceso a información sensible.</li>
          <li>Almacenamiento organizado de expedientes.</li>
          <li>Eliminación, bloqueo o resguardo de información cuando ya no sea necesaria.</li>
        </ul>
        <p>
          A pesar de las medidas adoptadas, ningún sistema digital es absolutamente invulnerable. Por ello, también
          recomendamos al cliente no compartir contraseñas, documentos o información delicada por medios inseguros o
          con personas no autorizadas.
        </p>
      </Section>

      <Section title="7. Conservación de datos">
        <p>
          Conservaremos sus datos personales durante el tiempo necesario para prestar el servicio contratado, dar
          seguimiento al trámite, atender aclaraciones, cumplir obligaciones legales, fiscales o administrativas y
          proteger derechos de ambas partes.
        </p>
        <p>
          Una vez cumplidas dichas finalidades, la información podrá ser bloqueada, eliminada o conservada únicamente
          cuando exista una obligación legal o causa justificada para ello.
        </p>
      </Section>

      <Section title="8. Derechos ARCO">
        <p>
          Usted tiene derecho a acceder, rectificar, cancelar u oponerse al tratamiento de sus datos personales, así
          como a revocar su consentimiento cuando legalmente proceda.
        </p>
        <p>Para ejercer estos derechos, deberá enviar una solicitud al correo <strong>{email}</strong> con la siguiente información:</p>
        <ul className="list-disc pl-6 space-y-1">
          <li>Nombre completo.</li>
          <li>Medio de contacto.</li>
          <li>Derecho que desea ejercer: acceso, rectificación, cancelación u oposición.</li>
          <li>Descripción clara de su solicitud.</li>
          <li>Documento que acredite su identidad.</li>
          <li>En caso de representación legal, documento que acredite dicha representación.</li>
        </ul>
        <p>Responderemos su solicitud conforme a los plazos y procedimientos previstos por la legislación aplicable.</p>
      </Section>

      <Section title="9. Uso de cookies y tecnologías similares">
        <p>
          Nuestro sitio web puede utilizar cookies o tecnologías similares para mejorar la experiencia de navegación,
          recordar preferencias, analizar el funcionamiento del sitio y facilitar procesos como formularios, sesiones
          o pagos.
        </p>
        <p>Usted puede configurar su navegador para bloquear o eliminar cookies, aunque algunas funciones del sitio podrían verse limitadas.</p>
      </Section>

      <Section title="10. Menores de edad">
        <p>
          Nuestros servicios están dirigidos principalmente a personas mayores de edad. Cuando un trámite involucre
          información de menores de edad, la información deberá ser proporcionada por madre, padre, tutor o
          representante legal autorizado.
        </p>
      </Section>

      <Section title="11. Cambios al aviso de privacidad">
        <p>
          Podremos modificar este Aviso de Privacidad cuando existan cambios legales, administrativos, tecnológicos,
          comerciales o de operación.
        </p>
        <p>Cualquier cambio será publicado en esta misma sección del sitio web. Recomendamos revisarlo periódicamente.</p>
      </Section>

      <Section title="12. Contacto">
        <p>
          Para dudas relacionadas con este Aviso de Privacidad o el tratamiento de sus datos personales, puede
          contactarnos en:
        </p>
        <ul className="list-none pl-0 space-y-1">
          <li><strong>Correo:</strong> {email}</li>
          <li><strong>Teléfono/WhatsApp:</strong> {phone}</li>
          <li><strong>Nombre comercial:</strong> Asesores Migratorios</li>
          <li><strong>Responsable:</strong> {c.legalName}</li>
        </ul>
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
