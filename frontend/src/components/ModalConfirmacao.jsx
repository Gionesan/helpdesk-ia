export default function ModalConfirmacao({
  titulo = 'Confirmar operação',
  mensagem,
  confirmLabel = 'Confirmar',
  onConfirmar,
  onCancelar
}) {
  return (
    <div className="modal modal-helpdesk d-block" tabIndex="-1" role="dialog" aria-modal="true" aria-label={titulo}>
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">{titulo}</h5>
            <button type="button" className="btn-close" aria-label="Fechar" onClick={onCancelar} />
          </div>
          <div className="modal-body">{mensagem}</div>
          <div className="modal-footer">
            <button type="button" className="btn btn-outline-secondary" onClick={onCancelar}>
              Cancelar
            </button>
            <button type="button" className="btn btn-danger" onClick={onConfirmar}>
              {confirmLabel}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
