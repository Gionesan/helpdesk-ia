import { useEffect, useState } from 'react';
import CardEstatistica from '../components/CardEstatistica.jsx';
import TabelaChamados from '../components/TabelaChamados.jsx';
import { buscarDashboard, mensagemErro } from '../services/api.js';

export default function Dashboard() {
  const [dados, setDados] = useState(null);
  const [erro, setErro] = useState('');
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    let ativo = true;

    buscarDashboard()
      .then((resposta) => {
        if (ativo) setDados(resposta);
      })
      .catch((error) => {
        if (ativo) setErro(mensagemErro(error));
      })
      .finally(() => {
        if (ativo) setCarregando(false);
      });

    return () => {
      ativo = false;
    };
  }, []);

  if (carregando) {
    return (
      <div className="alert alert-info">
        <i className="bi bi-hourglass-split me-2" aria-hidden="true" />
        Carregando indicadores do banco de dados...
      </div>
    );
  }

  if (erro) {
    return (
      <div className="alert alert-danger" role="alert">
        <i className="bi bi-exclamation-triangle me-2" aria-hidden="true" />
        {erro}
      </div>
    );
  }

  const indicadores = dados?.indicadores ?? {};

  return (
    <>
      <div className="page-titulo">
        <h2>Dashboard</h2>
        <p>Visão geral dos chamados e da equipe de suporte.</p>
      </div>

      <div className="row g-3 mb-4">
        <div className="col-6 col-lg-4 col-xl-2">
          <CardEstatistica
            titulo="Total de chamados"
            valor={indicadores.totalChamados ?? 0}
            icone="bi-ticket-perforated"
            cor="dark"
          />
        </div>
        <div className="col-6 col-lg-4 col-xl-2">
          <CardEstatistica
            titulo="Chamados abertos"
            valor={indicadores.chamadosAbertos ?? 0}
            icone="bi-folder2-open"
            cor="primary"
          />
        </div>
        <div className="col-6 col-lg-4 col-xl-2">
          <CardEstatistica
            titulo="Em andamento"
            valor={indicadores.chamadosEmAndamento ?? 0}
            icone="bi-arrow-repeat"
            cor="warning"
          />
        </div>
        <div className="col-6 col-lg-4 col-xl-2">
          <CardEstatistica
            titulo="Concluídos"
            valor={indicadores.chamadosConcluidos ?? 0}
            icone="bi-check-circle"
            cor="success"
          />
        </div>
        <div className="col-6 col-lg-4 col-xl-2">
          <CardEstatistica
            titulo="Técnicos cadastrados"
            valor={indicadores.totalTecnicos ?? 0}
            icone="bi-people"
            cor="danger"
          />
        </div>
      </div>

      <section className="card painel">
        <div className="card-header d-flex align-items-center justify-content-between">
          <div>
            <h5 className="mb-0">Últimos chamados cadastrados</h5>
            <small className="text-muted">Os cinco chamados mais recentes</small>
          </div>
          <i className="bi bi-clock-history fs-4 text-primary" aria-hidden="true" />
        </div>
        <div className="card-body">
          <TabelaChamados chamados={dados?.ultimosChamados ?? []} mostrarAcoes={false} />
        </div>
      </section>
    </>
  );
}
