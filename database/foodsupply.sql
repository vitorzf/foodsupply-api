-- phpMyAdmin SQL Dump
-- version 5.2.0
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Tempo de geração: 06-Nov-2022 às 22:29
-- Versão do servidor: 10.4.25-MariaDB
-- versão do PHP: 7.4.30

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Banco de dados: `foodsupply`
--

DELIMITER $$
--
-- Funções
--
CREATE DEFINER=`root`@`localhost` FUNCTION `retornaDescricaoStatus` (`status` VARCHAR(40)) RETURNS VARCHAR(40) CHARSET latin1  BEGIN

   DECLARE status_retorno VARCHAR(40);

   SET status_retorno = (
       CASE
        WHEN status = 'aguardando_vendedor' 
        	THEN 'Aguardando Confirmação do Vendedor'

        WHEN status = 'aguardando_comprador' 
        	THEN 'Aguardando Comprador'

        WHEN status = 'aguardando_pagamento'
            THEN 'Aguardando realização do Pagamento'

        WHEN status = 'pagamento_aprovado'
            THEN 'Pagamento Aprovado'

        WHEN status = 'processando_pagamento'
            THEN 'Processando Pagamento'

        WHEN status = 'pagamento_rejeitado'
            THEN 'Pagamento Rejeitado'

        WHEN status = 'pagamento_cancelado'
            THEN 'Pagamento Cancelado'

        WHEN status = 'pagamento_extornado'
            THEN 'Pagamento Extornado'

        WHEN status = 'enviado' 
        	THEN 'Pedido Enviado'

        WHEN status = 'entregue' 
        	THEN 'Pedido Entregue'
        ELSE status
    END);

RETURN status_retorno;

   RETURN status_retorno;

END$$

CREATE DEFINER=`root`@`localhost` FUNCTION `retornaNomeEstado` (`sigla` VARCHAR(2) CHARSET utf8mb4) RETURNS VARCHAR(40) CHARSET utf8mb4 NO SQL BEGIN

   DECLARE estado_retorno VARCHAR(40);

   SET estado_retorno = (
       CASE
        WHEN sigla = 'AC' 
    THEN 'Acre'
        WHEN sigla = 'AL' 
            THEN 'Alagoas'
        WHEN sigla = 'AP' 
            THEN 'Amapá'
        WHEN sigla = 'AM' 
            THEN 'Amazonas'
        WHEN sigla = 'BA' 
            THEN 'Bahia'
        WHEN sigla = 'CE' 
            THEN 'Ceará'
        WHEN sigla = 'DF' 
            THEN 'Distrito Federal'
        WHEN sigla = 'ES' 
            THEN 'Espirito Santo'
        WHEN sigla = 'GO' 
            THEN 'Goiás'
        WHEN sigla = 'MA' 
            THEN 'Maranhão'
        WHEN sigla = 'MS' 
            THEN 'Mato Grosso do Sul'
        WHEN sigla = 'MT' 
            THEN 'Mato Grosso'
        WHEN sigla = 'MG' 
            THEN 'Minas Gerais'
        WHEN sigla = 'PA' 
            THEN 'Pará'
        WHEN sigla = 'PB' 
            THEN 'Paraíba'
        WHEN sigla = 'PR' 
            THEN 'Paraná'
        WHEN sigla = 'PE' 
            THEN 'Pernambuco'
        WHEN sigla = 'PI' 
            THEN 'Piauí'
        WHEN sigla = 'RJ' 
            THEN 'Rio de Janeiro'
        WHEN sigla = 'RN' 
            THEN 'Rio Grande do Norte'
        WHEN sigla = 'RS' 
            THEN 'Rio Grande do Sul'
        WHEN sigla = 'RO' 
            THEN 'Rondônia'
        WHEN sigla = 'RR' 
            THEN 'Roraima'
        WHEN sigla = 'SC' 
            THEN 'Santa Catarina'
        WHEN sigla = 'SP' 
            THEN 'São Paulo'
        WHEN sigla = 'SE' 
            THEN 'Sergipe'
        WHEN sigla = 'TO' 
            THEN 'Tocantins'
        ELSE sigla
    END);

   RETURN estado_retorno;

END$$

DELIMITER ;

-- --------------------------------------------------------

--
-- Estrutura da tabela `categorias`
--

CREATE TABLE `categorias` (
  `id` int(11) NOT NULL,
  `nome` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

--
-- Extraindo dados da tabela `categorias`
--

INSERT INTO `categorias` (`id`, `nome`) VALUES
(1, 'Carnes'),
(2, 'Cerveja');

-- --------------------------------------------------------

--
-- Estrutura da tabela `endereco`
--

CREATE TABLE `endereco` (
  `id` int(11) NOT NULL,
  `cep` varchar(8) NOT NULL,
  `uf` varchar(2) NOT NULL,
  `cidade` varchar(100) NOT NULL,
  `bairro` varchar(255) NOT NULL,
  `endereco` varchar(255) NOT NULL,
  `numero` int(11) NOT NULL,
  `usuario_id` int(11) NOT NULL,
  `principal` tinyint(1) NOT NULL DEFAULT 0,
  `ativo` tinyint(1) NOT NULL DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

--
-- Extraindo dados da tabela `endereco`
--

INSERT INTO `endereco` (`id`, `cep`, `uf`, `cidade`, `bairro`, `endereco`, `numero`, `usuario_id`, `principal`, `ativo`) VALUES
(1, '17511801', 'SP', 'Marília', 'Jardim Lavínia', 'Amélia Volta Laplechade', 57, 9, 0, 1),
(2, '17511801', 'SP', 'Teresina', 'Direceu Arcoverde II', 'Quadra 333', 1, 9, 0, 1),
(3, '17511801', 'SP', 'Teresina', 'Direceu Arcoverde II', 'Quadra 333', 3, 9, 0, 1),
(4, '17511801', 'SP', 'Teresina', 'Direceu Arcoverde II', 'Quadra 333', 1, 10, 1, 1),
(5, '17511801', 'SP', 'Teresina', 'Direceu Arcoverde II', 'Quadra 333', 1, 9, 1, 1);

-- --------------------------------------------------------

--
-- Estrutura da tabela `produto`
--

CREATE TABLE `produto` (
  `id` int(11) NOT NULL,
  `sku` varchar(255) NOT NULL,
  `titulo` varchar(255) NOT NULL,
  `descricao` text NOT NULL,
  `fotos` text DEFAULT NULL,
  `estoque` int(11) NOT NULL DEFAULT 0,
  `preco` decimal(15,2) NOT NULL,
  `categoria_id` int(11) DEFAULT NULL,
  `medida_id` int(11) DEFAULT NULL,
  `usuario_id` int(11) NOT NULL,
  `data_hora_cadastro` timestamp NOT NULL DEFAULT current_timestamp(),
  `ativo` tinyint(1) NOT NULL DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

--
-- Extraindo dados da tabela `produto`
--

INSERT INTO `produto` (`id`, `sku`, `titulo`, `descricao`, `fotos`, `estoque`, `preco`, `categoria_id`, `medida_id`, `usuario_id`, `data_hora_cadastro`, `ativo`) VALUES
(3, 'ProdTeste1', 'Produto de teste 1', 'Este é o teste de descrição do produto, pode dar tudo errado ou tudo certo, vai la saber', '[{\"url\":\"https://talcha.vteximg.com.br/arquivos/ids/170030-1000-1000/teste.jpg?v=637685222639430000\",\"ordem\":0},{\"url\":\"https://static3.tcdn.com.br/img/img_prod/99941/produto_teste_auaha_24522_1_f816ad73890b2db46e6e460c44ae5d22.png\",\"ordem\":1}]', 1005, '200.00', 1, 2, 9, '2022-05-13 05:18:14', 1),
(4, 'ProdTeste1', 'Produto de teste 4', 'Este é o teste de descrição do produto, pode dar tudo errado ou tudo certo, vai la saber', '[{\"url\":\"https://talcha.vteximg.com.br/arquivos/ids/170030-1000-1000/teste.jpg?v=637685222639430000\",\"ordem\":0},{\"url\":\"https://static3.tcdn.com.br/img/img_prod/99941/produto_teste_auaha_24522_1_f816ad73890b2db46e6e460c44ae5d22.png\",\"ordem\":1}]', 0, '120.50', 1, 2, 10, '2022-05-26 23:38:34', 1),
(5, 'ProdTeste55', 'Produto de teste 4', 'Este é o teste de descrição do produto, pode dar tudo errado ou tudo certo, vai la saber', '[{\"url\":\"https://talcha.vteximg.com.br/arquivos/ids/170030-1000-1000/teste.jpg?v=637685222639430000\",\"ordem\":0},{\"url\":\"https://static3.tcdn.com.br/img/img_prod/99941/produto_teste_auaha_24522_1_f816ad73890b2db46e6e460c44ae5d22.png\",\"ordem\":1}]', 100, '120.50', 1, 2, 9, '2022-09-25 05:58:25', 1);

-- --------------------------------------------------------

--
-- Estrutura da tabela `unidade_medida`
--

CREATE TABLE `unidade_medida` (
  `id` int(11) NOT NULL,
  `sigla` varchar(5) NOT NULL,
  `nome` varchar(20) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

--
-- Extraindo dados da tabela `unidade_medida`
--

INSERT INTO `unidade_medida` (`id`, `sigla`, `nome`) VALUES
(1, 'KG', 'Quilo Gramas'),
(2, 'G', 'Gramas'),
(3, 'ML', 'Mililitros'),
(4, 'L', 'Litros'),
(5, 'UN', 'Unidade');

-- --------------------------------------------------------

--
-- Estrutura da tabela `usuario`
--

CREATE TABLE `usuario` (
  `id` int(11) NOT NULL,
  `email` varchar(255) NOT NULL,
  `usuario` varchar(255) NOT NULL,
  `nome` varchar(200) NOT NULL,
  `sobrenome` varchar(200) NOT NULL,
  `nome_vendedor` varchar(255) DEFAULT NULL,
  `senha` varchar(32) NOT NULL,
  `foto` varchar(500) NOT NULL DEFAULT 'https://i.imgur.com/tpcw8Rc.png',
  `ativo` tinyint(1) NOT NULL DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

--
-- Extraindo dados da tabela `usuario`
--

INSERT INTO `usuario` (`id`, `email`, `usuario`, `nome`, `sobrenome`, `nome_vendedor`, `senha`, `foto`, `ativo`) VALUES
(9, 'igovitorbr@gmail.com', 'vitorzf', 'Vitor', 'Zafra', 'Vitor Stores', '202cb962ac59075b964b07152d234b70', '', 1),
(10, 'monychan@gmail.com', 'monygasai', 'teste', 'teste2', NULL, '202cb962ac59075b964b07152d234b70', '', 1),
(11, 'monychan2@gmail.com', 'monygasai33', 'teste2', 'teste3', NULL, 'aa1bf4646de67fd9086cf6c79007026c', '', 1),
(12, 'jonatan@gmail.com', 'Jonatan', '', '', NULL, 'e10adc3949ba59abbe56e057f20f883e', '', 1);

-- --------------------------------------------------------

--
-- Estrutura da tabela `venda`
--

CREATE TABLE `venda` (
  `id` int(11) NOT NULL,
  `status` varchar(50) NOT NULL DEFAULT 'Aguardando Pagamento',
  `identificador_pagamento` varchar(32) NOT NULL,
  `vendedor_id` int(11) NOT NULL,
  `usuario_id` int(11) NOT NULL,
  `endereco_id` int(11) NOT NULL,
  `valor_frete` decimal(10,2) NOT NULL DEFAULT 0.00,
  `valor_total` int(11) NOT NULL,
  `rastreio` varchar(255) NOT NULL,
  `url_rastreio` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

--
-- Extraindo dados da tabela `venda`
--

INSERT INTO `venda` (`id`, `status`, `identificador_pagamento`, `vendedor_id`, `usuario_id`, `endereco_id`, `valor_frete`, `valor_total`, `rastreio`, `url_rastreio`) VALUES
(16, 'aguardando_vendedor', '0fcb7606-afb6-4f1b-98f8-3f7797ed', 10, 9, 4, '0.00', 12050, '', ''),
(17, 'entregue', '802141b3-17be-47b3-a4c9-dbfc2dac', 10, 9, 4, '160.00', 12210, 'AA123456785BR', 'https://rastreamento.correios.com.br/app/index.php'),
(18, 'aguardando_vendedor', '9fcff94d-f9ba-4e9c-a6e8-2c36e1c0', 10, 9, 4, '0.00', 12050, '', ''),
(19, 'enviado', 'd222f52c-78b8-4dc0-ac01-15bb333a', 10, 9, 4, '200.00', 12250, 'AA123456785BR', 'https://rastreamento.correios.com.br/app/index.php'),
(20, 'aguardando_vendedor', '6e05fff6-5ccc-4526-a136-16668e57', 10, 9, 4, '0.00', 12050, '', '');

-- --------------------------------------------------------

--
-- Estrutura da tabela `venda_pagamento`
--

CREATE TABLE `venda_pagamento` (
  `id` int(11) NOT NULL,
  `venda_id` int(11) NOT NULL,
  `cliente_id` int(11) NOT NULL,
  `url` varchar(300) NOT NULL,
  `referencia_externa` varchar(100) NOT NULL,
  `callback` text DEFAULT NULL,
  `dados_criacao` text NOT NULL,
  `status` varchar(50) NOT NULL,
  `data` timestamp NOT NULL DEFAULT current_timestamp(),
  `ultima_alteracao` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

--
-- Extraindo dados da tabela `venda_pagamento`
--

INSERT INTO `venda_pagamento` (`id`, `venda_id`, `cliente_id`, `url`, `referencia_externa`, `callback`, `dados_criacao`, `status`, `data`, `ultima_alteracao`) VALUES
(3, 19, 9, '1234', 'd222f52c-78b8-4dc0-ac01-15bb333a', NULL, '{\"additional_info\":\"\",\"auto_return\":\"approved\",\"back_urls\":{\"failure\":\"https://foodsupply2.herokuapp.com/mercadopago/failure\",\"pending\":\"https://foodsupply2.herokuapp.com/mercadopago/pending\",\"success\":\"https://foodsupply2.herokuapp.com/mercadopago/success\"},\"binary_mode\":false,\"client_id\":\"2939643210865409\",\"collector_id\":375334628,\"coupon_code\":null,\"coupon_labels\":null,\"date_created\":\"2022-09-30T00:23:33.125-04:00\",\"date_of_expiration\":null,\"expiration_date_from\":null,\"expiration_date_to\":null,\"expires\":false,\"external_reference\":\"d222f52c-78b8-4dc0-ac01-15bb333a\",\"id\":\"375334628-cad5fd82-0596-46ac-8f6c-274f9b1f386a\",\"init_point\":\"https://www.mercadopago.com.br/checkout/v1/redirect?pref_id=375334628-cad5fd82-0596-46ac-8f6c-274f9b1f386a\",\"internal_metadata\":null,\"items\":[{\"id\":\"ProdTeste1\",\"category_id\":\"\",\"currency_id\":\"BRL\",\"description\":\"Este é o teste de descrição do produto, pode dar tudo errado ou tudo certo, vai la saber\",\"picture_url\":\"https://talcha.vteximg.com.br/arquivos/ids/170030-1000-1000/teste.jpg?v=637685222639430000\",\"title\":\"Produto de teste 4\",\"quantity\":100,\"unit_price\":120.5},{\"id\":\"FreteEnvio\",\"category_id\":\"\",\"currency_id\":\"BRL\",\"description\":\"Este é um adicional do valor dos itens cobrado para envio da mercadoria\",\"title\":\"Valor total de Frete\",\"quantity\":1,\"unit_price\":200}],\"marketplace\":\"NONE\",\"marketplace_fee\":0,\"metadata\":{},\"notification_url\":\"https://foodsupply2.herokuapp.com/mercadopago\",\"operation_type\":\"regular_payment\",\"payer\":{\"phone\":{\"area_code\":\"\",\"number\":\"\"},\"address\":{\"zip_code\":\"\",\"street_name\":\"Quadra 333\",\"street_number\":\"1\"},\"email\":\"\",\"identification\":{\"number\":\"\",\"type\":\"\"},\"name\":\"\",\"surname\":\"\",\"date_created\":null,\"last_purchase\":null},\"payment_methods\":{\"default_card_id\":null,\"default_payment_method_id\":null,\"excluded_payment_methods\":[{\"id\":\"\"}],\"excluded_payment_types\":[{\"id\":\"ticket\"}],\"installments\":1,\"default_installments\":1},\"processing_modes\":null,\"product_id\":null,\"redirect_urls\":{\"failure\":\"\",\"pending\":\"\",\"success\":\"\"},\"sandbox_init_point\":\"https://sandbox.mercadopago.com.br/checkout/v1/redirect?pref_id=375334628-cad5fd82-0596-46ac-8f6c-274f9b1f386a\",\"site_id\":\"MLB\",\"shipments\":{\"default_shipping_method\":null,\"receiver_address\":{\"zip_code\":\"\",\"street_name\":\"\",\"street_number\":null,\"floor\":\"\",\"apartment\":\"\",\"city_name\":null,\"state_name\":null,\"country_name\":null}},\"total_amount\":null,\"last_updated\":null}', 'pending', '2022-11-05 21:00:56', '2022-09-30 04:23:33'),
(13, 17, 9, 'https://sandbox.mercadopago.com.br/checkout/v1/redirect?pref_id=375334628-6f1a0f3f-f661-4fd4-ab5a-f5ef6ae65711', '802141b3-17be-47b3-a4c9-dbfc2dac', NULL, '{\"additional_info\":\"\",\"auto_return\":\"approved\",\"back_urls\":{\"failure\":\"https://foodsupply2.herokuapp.com/mercadopago/failure\",\"pending\":\"https://foodsupply2.herokuapp.com/mercadopago/pending\",\"success\":\"https://foodsupply2.herokuapp.com/mercadopago/success\"},\"binary_mode\":false,\"client_id\":\"2939643210865409\",\"collector_id\":375334628,\"coupon_code\":null,\"coupon_labels\":null,\"date_created\":\"2022-11-05T17:16:14.029-04:00\",\"date_of_expiration\":null,\"expiration_date_from\":null,\"expiration_date_to\":null,\"expires\":false,\"external_reference\":\"802141b3-17be-47b3-a4c9-dbfc2dac\",\"id\":\"375334628-6f1a0f3f-f661-4fd4-ab5a-f5ef6ae65711\",\"init_point\":\"https://www.mercadopago.com.br/checkout/v1/redirect?pref_id=375334628-6f1a0f3f-f661-4fd4-ab5a-f5ef6ae65711\",\"internal_metadata\":null,\"items\":[{\"id\":\"ProdTeste1\",\"category_id\":\"\",\"currency_id\":\"BRL\",\"description\":\"Este é o teste de descrição do produto, pode dar tudo errado ou tudo certo, vai la saber\",\"picture_url\":\"https://talcha.vteximg.com.br/arquivos/ids/170030-1000-1000/teste.jpg?v=637685222639430000\",\"title\":\"Produto de teste 4\",\"quantity\":100,\"unit_price\":120.5},{\"id\":\"FreteEnvio\",\"category_id\":\"\",\"currency_id\":\"BRL\",\"description\":\"Este é um adicional do valor dos itens cobrado para envio da mercadoria\",\"title\":\"Valor total de Frete\",\"quantity\":1,\"unit_price\":160}],\"marketplace\":\"NONE\",\"marketplace_fee\":0,\"metadata\":{},\"notification_url\":\"https://foodsupply2.herokuapp.com/mercadopago\",\"operation_type\":\"regular_payment\",\"payer\":{\"phone\":{\"area_code\":\"\",\"number\":\"\"},\"address\":{\"zip_code\":\"\",\"street_name\":\"Quadra 333\",\"street_number\":\"1\"},\"email\":\"\",\"identification\":{\"number\":\"\",\"type\":\"\"},\"name\":\"\",\"surname\":\"\",\"date_created\":null,\"last_purchase\":null},\"payment_methods\":{\"default_card_id\":null,\"default_payment_method_id\":null,\"excluded_payment_methods\":[{\"id\":\"\"}],\"excluded_payment_types\":[{\"id\":\"ticket\"}],\"installments\":1,\"default_installments\":1},\"processing_modes\":null,\"product_id\":null,\"redirect_urls\":{\"failure\":\"\",\"pending\":\"\",\"success\":\"\"},\"sandbox_init_point\":\"https://sandbox.mercadopago.com.br/checkout/v1/redirect?pref_id=375334628-6f1a0f3f-f661-4fd4-ab5a-f5ef6ae65711\",\"site_id\":\"MLB\",\"shipments\":{\"default_shipping_method\":null,\"receiver_address\":{\"zip_code\":\"\",\"street_name\":\"\",\"street_number\":null,\"floor\":\"\",\"apartment\":\"\",\"city_name\":null,\"state_name\":null,\"country_name\":null}},\"total_amount\":null,\"last_updated\":null}', 'pending', '2022-10-30 22:59:06', '2022-11-05 21:16:43');

-- --------------------------------------------------------

--
-- Estrutura da tabela `venda_produto`
--

CREATE TABLE `venda_produto` (
  `id` int(11) NOT NULL,
  `venda_id` int(11) NOT NULL,
  `produto_id` int(11) NOT NULL,
  `quantidade` int(11) NOT NULL,
  `valor_unitario` decimal(10,2) NOT NULL,
  `valor_total` decimal(10,2) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

--
-- Extraindo dados da tabela `venda_produto`
--

INSERT INTO `venda_produto` (`id`, `venda_id`, `produto_id`, `quantidade`, `valor_unitario`, `valor_total`) VALUES
(8, 16, 4, 100, '120.50', '12050.00'),
(9, 17, 4, 100, '120.50', '12050.00'),
(10, 18, 4, 100, '120.50', '12050.00'),
(11, 19, 4, 100, '120.50', '12050.00'),
(12, 20, 4, 100, '120.50', '12050.00');

--
-- Acionadores `venda_produto`
--
DELIMITER $$
CREATE TRIGGER `removeEstoqueVenda` AFTER INSERT ON `venda_produto` FOR EACH ROW UPDATE produto SET estoque = estoque = new.quantidade WHERE id = new.produto_id
$$
DELIMITER ;

--
-- Índices para tabelas despejadas
--

--
-- Índices para tabela `categorias`
--
ALTER TABLE `categorias`
  ADD PRIMARY KEY (`id`);

--
-- Índices para tabela `endereco`
--
ALTER TABLE `endereco`
  ADD PRIMARY KEY (`id`),
  ADD KEY `endereco_ibfk_1` (`usuario_id`);

--
-- Índices para tabela `produto`
--
ALTER TABLE `produto`
  ADD PRIMARY KEY (`id`),
  ADD KEY `categoria_id` (`categoria_id`),
  ADD KEY `medida_id` (`medida_id`);

--
-- Índices para tabela `unidade_medida`
--
ALTER TABLE `unidade_medida`
  ADD PRIMARY KEY (`id`);

--
-- Índices para tabela `usuario`
--
ALTER TABLE `usuario`
  ADD PRIMARY KEY (`id`);

--
-- Índices para tabela `venda`
--
ALTER TABLE `venda`
  ADD PRIMARY KEY (`id`),
  ADD KEY `endereco_id` (`endereco_id`),
  ADD KEY `usuario_id` (`usuario_id`),
  ADD KEY `vendedor_id` (`vendedor_id`);

--
-- Índices para tabela `venda_pagamento`
--
ALTER TABLE `venda_pagamento`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `referencia_externa` (`referencia_externa`);

--
-- Índices para tabela `venda_produto`
--
ALTER TABLE `venda_produto`
  ADD PRIMARY KEY (`id`),
  ADD KEY `produto_id` (`produto_id`),
  ADD KEY `venda_id` (`venda_id`);

--
-- AUTO_INCREMENT de tabelas despejadas
--

--
-- AUTO_INCREMENT de tabela `categorias`
--
ALTER TABLE `categorias`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT de tabela `endereco`
--
ALTER TABLE `endereco`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT de tabela `produto`
--
ALTER TABLE `produto`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT de tabela `unidade_medida`
--
ALTER TABLE `unidade_medida`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT de tabela `usuario`
--
ALTER TABLE `usuario`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=13;

--
-- AUTO_INCREMENT de tabela `venda`
--
ALTER TABLE `venda`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=21;

--
-- AUTO_INCREMENT de tabela `venda_pagamento`
--
ALTER TABLE `venda_pagamento`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=17;

--
-- AUTO_INCREMENT de tabela `venda_produto`
--
ALTER TABLE `venda_produto`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=13;

--
-- Restrições para despejos de tabelas
--

--
-- Limitadores para a tabela `endereco`
--
ALTER TABLE `endereco`
  ADD CONSTRAINT `endereco_ibfk_1` FOREIGN KEY (`usuario_id`) REFERENCES `usuario` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Limitadores para a tabela `produto`
--
ALTER TABLE `produto`
  ADD CONSTRAINT `produto_ibfk_1` FOREIGN KEY (`categoria_id`) REFERENCES `categorias` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `produto_ibfk_2` FOREIGN KEY (`medida_id`) REFERENCES `unidade_medida` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;

--
-- Limitadores para a tabela `venda`
--
ALTER TABLE `venda`
  ADD CONSTRAINT `venda_ibfk_1` FOREIGN KEY (`endereco_id`) REFERENCES `endereco` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  ADD CONSTRAINT `venda_ibfk_2` FOREIGN KEY (`usuario_id`) REFERENCES `usuario` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  ADD CONSTRAINT `venda_ibfk_3` FOREIGN KEY (`vendedor_id`) REFERENCES `usuario` (`id`) ON DELETE NO ACTION ON UPDATE CASCADE;

--
-- Limitadores para a tabela `venda_produto`
--
ALTER TABLE `venda_produto`
  ADD CONSTRAINT `venda_produto_ibfk_1` FOREIGN KEY (`produto_id`) REFERENCES `produto` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  ADD CONSTRAINT `venda_produto_ibfk_2` FOREIGN KEY (`venda_id`) REFERENCES `venda` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
