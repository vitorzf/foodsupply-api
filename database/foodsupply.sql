-- phpMyAdmin SQL Dump
-- version 4.7.4
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: 27-Maio-2022 às 23:16
-- Versão do servidor: 10.1.29-MariaDB
-- PHP Version: 7.2.0

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET AUTOCOMMIT = 0;
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `foodsupply`
--

DELIMITER $$
--
-- Functions
--
CREATE DEFINER=`root`@`localhost` FUNCTION `retornaDescricaoStatus` (`status` VARCHAR(40)) RETURNS VARCHAR(40) CHARSET latin1 BEGIN

   DECLARE status_retorno VARCHAR(40);

   SET status_retorno = (
       CASE
        WHEN status = 'aguardando_vendedor' 
        	THEN 'Aguardando Confirmação do Vendedor'
        WHEN status = 'aguardando_pagamento' 
        	THEN 'Aguardando Pagamento'
        WHEN status = 'pagamento_aprovado' 
        	THEN 'Pagamento Aprovado'
        WHEN status = 'enviado' 
        	THEN 'Pedido Enviado'
        WHEN status = 'entregue' 
        	THEN 'Pedido Entregue'
        ELSE status
    END);

RETURN status_retorno;

   RETURN status_retorno;

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
  `principal` tinyint(1) NOT NULL DEFAULT '0',
  `ativo` tinyint(1) NOT NULL DEFAULT '1'
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

--
-- Extraindo dados da tabela `endereco`
--

INSERT INTO `endereco` (`id`, `cep`, `uf`, `cidade`, `bairro`, `endereco`, `numero`, `usuario_id`, `principal`, `ativo`) VALUES
(1, '17511801', 'SP', 'Marília', 'Jardim Lavínia', 'Amélia Volta Laplechade', 57, 9, 0, 1),
(2, '17511801', 'SP', 'Teresina', 'Direceu Arcoverde II', 'Quadra 333', 1, 9, 0, 1),
(3, '17511801', 'SP', 'Teresina', 'Direceu Arcoverde II', 'Quadra 333', 3, 9, 1, 1),
(4, '17511801', 'SP', 'Teresina', 'Direceu Arcoverde II', 'Quadra 333', 1, 10, 1, 1);

-- --------------------------------------------------------

--
-- Estrutura da tabela `produto`
--

CREATE TABLE `produto` (
  `id` int(11) NOT NULL,
  `sku` varchar(255) NOT NULL,
  `titulo` varchar(255) NOT NULL,
  `descricao` text NOT NULL,
  `fotos` text,
  `estoque` int(11) NOT NULL DEFAULT '0',
  `preco` decimal(15,2) NOT NULL,
  `categoria_id` int(11) DEFAULT NULL,
  `medida_id` int(11) DEFAULT NULL,
  `usuario_id` int(11) NOT NULL,
  `data_hora_cadastro` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `ativo` tinyint(1) NOT NULL DEFAULT '1'
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

--
-- Extraindo dados da tabela `produto`
--

INSERT INTO `produto` (`id`, `sku`, `titulo`, `descricao`, `fotos`, `estoque`, `preco`, `categoria_id`, `medida_id`, `usuario_id`, `data_hora_cadastro`, `ativo`) VALUES
(3, 'ProdTeste1', 'Produto de teste 1', 'Este é o teste de descrição do produto, pode dar tudo errado ou tudo certo, vai la saber', '[{\"url\":\"https://talcha.vteximg.com.br/arquivos/ids/170030-1000-1000/teste.jpg?v=637685222639430000\",\"ordem\":0},{\"url\":\"https://static3.tcdn.com.br/img/img_prod/99941/produto_teste_auaha_24522_1_f816ad73890b2db46e6e460c44ae5d22.png\",\"ordem\":1}]', 1005, '200.00', 1, 2, 9, '2022-05-13 05:18:14', 1),
(4, 'ProdTeste1', 'Produto de teste 4', 'Este é o teste de descrição do produto, pode dar tudo errado ou tudo certo, vai la saber', '[{\"url\":\"https://talcha.vteximg.com.br/arquivos/ids/170030-1000-1000/teste.jpg?v=637685222639430000\",\"ordem\":0},{\"url\":\"https://static3.tcdn.com.br/img/img_prod/99941/produto_teste_auaha_24522_1_f816ad73890b2db46e6e460c44ae5d22.png\",\"ordem\":1}]', 1000, '120.50', 1, 2, 10, '2022-05-26 23:38:34', 1);

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
  `nome_vendedor` varchar(255) DEFAULT NULL,
  `senha` varchar(32) NOT NULL,
  `foto` text,
  `ativo` tinyint(1) NOT NULL DEFAULT '1'
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

--
-- Extraindo dados da tabela `usuario`
--

INSERT INTO `usuario` (`id`, `email`, `usuario`, `nome_vendedor`, `senha`, `foto`, `ativo`) VALUES
(9, 'igovitorbr@gmail.com', 'vitorzf', 'Vitor Store', '202cb962ac59075b964b07152d234b70', NULL, 1),
(10, 'monychan@gmail.com', 'monygasai', NULL, '202cb962ac59075b964b07152d234b70', NULL, 1);

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
  `valor_frete` decimal(10,2) NOT NULL DEFAULT '0.00',
  `valor_total` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

--
-- Extraindo dados da tabela `venda`
--

INSERT INTO `venda` (`id`, `status`, `identificador_pagamento`, `vendedor_id`, `usuario_id`, `endereco_id`, `valor_frete`, `valor_total`) VALUES
(16, 'aguardando_vendedor', '0fcb7606-afb6-4f1b-98f8-3f7797ed', 10, 9, 4, '0.00', 12050),
(17, 'aguardando_comprador', '802141b3-17be-47b3-a4c9-dbfc2dac', 10, 9, 4, '160.00', 12210),
(18, 'aguardando_vendedor', '9fcff94d-f9ba-4e9c-a6e8-2c36e1c0', 10, 9, 4, '0.00', 12050),
(19, 'aguardando_comprador', 'd222f52c-78b8-4dc0-ac01-15bb333a', 10, 9, 4, '200.00', 12250);

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
(11, 19, 4, 100, '120.50', '12050.00');

--
-- Acionadores `venda_produto`
--
DELIMITER $$
CREATE TRIGGER `removeEstoqueVenda` AFTER INSERT ON `venda_produto` FOR EACH ROW UPDATE produto SET estoque = estoque = new.quantidade WHERE id = new.produto_id
$$
DELIMITER ;

--
-- Indexes for dumped tables
--

--
-- Indexes for table `categorias`
--
ALTER TABLE `categorias`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `endereco`
--
ALTER TABLE `endereco`
  ADD PRIMARY KEY (`id`),
  ADD KEY `endereco_ibfk_1` (`usuario_id`);

--
-- Indexes for table `produto`
--
ALTER TABLE `produto`
  ADD PRIMARY KEY (`id`),
  ADD KEY `categoria_id` (`categoria_id`),
  ADD KEY `medida_id` (`medida_id`);

--
-- Indexes for table `unidade_medida`
--
ALTER TABLE `unidade_medida`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `usuario`
--
ALTER TABLE `usuario`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `venda`
--
ALTER TABLE `venda`
  ADD PRIMARY KEY (`id`),
  ADD KEY `endereco_id` (`endereco_id`),
  ADD KEY `usuario_id` (`usuario_id`),
  ADD KEY `vendedor_id` (`vendedor_id`);

--
-- Indexes for table `venda_produto`
--
ALTER TABLE `venda_produto`
  ADD PRIMARY KEY (`id`),
  ADD KEY `produto_id` (`produto_id`),
  ADD KEY `venda_id` (`venda_id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `categorias`
--
ALTER TABLE `categorias`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `endereco`
--
ALTER TABLE `endereco`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `produto`
--
ALTER TABLE `produto`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `unidade_medida`
--
ALTER TABLE `unidade_medida`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT for table `usuario`
--
ALTER TABLE `usuario`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- AUTO_INCREMENT for table `venda`
--
ALTER TABLE `venda`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=20;

--
-- AUTO_INCREMENT for table `venda_produto`
--
ALTER TABLE `venda_produto`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=12;

--
-- Constraints for dumped tables
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
