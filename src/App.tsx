import { useState } from "react";
import { Layout, Typography, Space, message, Spin, Button } from "antd";
import {
  LoadingOutlined,
  SettingOutlined,
  FireOutlined,
} from "@ant-design/icons";
import AddressInput from "./components/AddressInput";
import SummaryCard from "./components/SummaryCard";
import DexTransactionTable from "./components/DexTransactionTable";
import BatchResultTable from "./components/BatchResultTable";
import PriceIndicator from "./components/PriceIndicator";
import ApiKeySettings from "./components/ApiKeySettings";
import AlphaTokenSettings from "./components/AlphaTokenSettings";
import { getAllTransactions, DEFAULT_CHAIN_ID } from "./services/api";
import {
  calculateDailySummary,
  groupTransactionsByHash,
  calculateAndUpdateSlippage,
  processBatchAddresses,
  calculateBatchSummary,
} from "./utils/dataProcessor";
import type {
  DailySummary,
  DexTransactionSummary,
  AddressSummary,
} from "./types";
import { saveQueryState } from "./utils/queryStateManager";

const { Content } = Layout;
const { Title, Paragraph } = Typography;

function App() {
  const [loading, setLoading] = useState(false);
  const [dexTransactions, setDexTransactions] = useState<
    DexTransactionSummary[]
  >([]);
  const [dailySummary, setDailySummary] = useState<DailySummary | null>(null);
  const [searchedAddress, setSearchedAddress] = useState<string>("");
  const [loadingProgress, setLoadingProgress] = useState<string>("");

  // 批量查询相关状态
  const [isBatchMode, setIsBatchMode] = useState(false);
  const [batchResults, setBatchResults] = useState<AddressSummary[]>([]);
  const [searchedAddresses, setSearchedAddresses] = useState<string[]>([]);

  // API Key设置状态
  const [showApiKeySettings, setShowApiKeySettings] = useState(false);

  // Alpha代币设置状态
  const [showAlphaTokenSettings, setShowAlphaTokenSettings] = useState(false);

  const handleSearch = async (address: string) => {
    setLoading(true);
    setSearchedAddress(address);

    // 重置批量模式状态
    setIsBatchMode(false);
    setBatchResults([]);
    setSearchedAddresses([]);

    // 保存查询状态
    saveQueryState("single", [address]);

    const chainName = "BNB Smart Chain";
    setLoadingProgress(`正在连接 ${chainName}...`);

    try {
      // 监听控制台日志来更新进度
      const originalLog = console.log;
      console.log = (...args) => {
        const message = args.join(" ");
        if (message.includes("正在获取地址")) {
          setLoadingProgress(`正在连接 Etherscan API... (${chainName})`);
        } else if (message.includes("正在获取普通交易")) {
          setLoadingProgress("正在获取普通交易数据...");
        } else if (message.includes("正在获取代币交易")) {
          setLoadingProgress("正在获取代币交易数据...");
        } else if (message.includes("正在并行获取")) {
          setLoadingProgress("正在并行获取交易数据...");
        } else if (
          message.includes("获取到") &&
          message.includes("笔普通交易")
        ) {
          setLoadingProgress("正在处理普通交易...");
        } else if (
          message.includes("获取到") &&
          message.includes("笔代币交易")
        ) {
          setLoadingProgress("正在处理代币交易...");
        } else if (message.includes("过滤后得到")) {
          setLoadingProgress("正在过滤今日交易...");
        }
        originalLog(...args);
      };

      // 获取交易数据
      const txs = await getAllTransactions(address, DEFAULT_CHAIN_ID);

      // 恢复原始的 console.log
      console.log = originalLog;

      if (txs.length > 0) {
        let dexTxs = groupTransactionsByHash(txs, address);

        // 计算并更新每笔交易的滑点损耗
        dexTxs = await calculateAndUpdateSlippage(dexTxs);

        const summary = await calculateDailySummary(txs, address, 0);

        setDexTransactions(dexTxs);
        setDailySummary(summary);
        message.success(
          `成功获取 ${dexTxs.length} 笔 DEX 交易记录，BN Alpha 分数: ${summary.bnAlphaScore}`
        );
      } else {
        setDexTransactions([]);
        setDailySummary({
          totalTransactions: 0,
          totalGasFee: 0,
          totalValue: 0,
          uniqueTokens: 0,
          bnAlphaScore: 0,
          walletBalance: 0,
          todayBuyAmount: 0,
          slippageLoss: 0,
          totalBuyVolume: 0,
          totalBuyVolumeWithMultiplier: 0,
          alphaVolume: 0,
          normalVolume: 0,
        });
        message.info(`该地址在 ${chainName} 今日暂无交易记录`);
      }
    } catch (err) {
      message.error("查询失败，请稍后重试");
      console.error("Error fetching transactions:", err);
    } finally {
      setLoading(false);
      setLoadingProgress("");
    }
  };

  // 批量查询处理函数
  const handleBatchSearch = async (addresses: string[]) => {
    setLoading(true);
    setIsBatchMode(true);
    setSearchedAddresses(addresses);
    setBatchResults([]);
    setDexTransactions([]);
    setDailySummary(null);
    setSearchedAddress("");

    // 保存查询状态
    saveQueryState("batch", addresses);

    setLoadingProgress(`正在批量查询 ${addresses.length} 个地址...`);

    try {
      // 使用批量处理函数，带进度回调
      const results = await processBatchAddresses(
        addresses,
        getAllTransactions,
        DEFAULT_CHAIN_ID,
        (current, total, address) => {
          setLoadingProgress(
            `正在查询第 ${current}/${total} 个地址: ${address.slice(
              0,
              6
            )}...${address.slice(-4)}`
          );
        }
      );

      // 计算总汇总
      const totalSummary = calculateBatchSummary(results);

      setBatchResults(results);
      setDailySummary(totalSummary);

      const successCount = results.filter(
        (r) => r.summary.totalTransactions > 0
      ).length;
      const totalTransactions = results.reduce(
        (sum, result) => sum + result.dexTransactions.length,
        0
      );

      message.success(
        `批量查询完成！${successCount}/${addresses.length} 个地址有交易数据，共 ${totalTransactions} 笔 DEX 交易记录，总 BN Alpha 分数: ${totalSummary.bnAlphaScore}`
      );
    } catch (err) {
      message.error("批量查询失败，请稍后重试");
      console.error("Error in batch search:", err);
    } finally {
      setLoading(false);
      setLoadingProgress("");
    }
  };

  return (
    <Layout style={{ minHeight: "100vh" }}>
      <Content style={{ padding: "24px", background: "#f5f5f5" }}>
        <div
          style={{ maxWidth: "1200px", margin: "0 auto", position: "relative" }}
        >
          {/* 左上角推特关注按钮 */}
          <div
            style={{
              position: "absolute",
              top: "0",
              left: "0",
              zIndex: 10,
            }}
          >
            <Button
              type="primary"
              size="small"
              onClick={() => window.open("https://t.me/winter_k", "_blank")}
              style={{
                fontSize: "12px",
                fontWeight: "500",
                padding: "0 16px",
                height: "32px",
                backgroundColor: "#1DA1F2",
                borderColor: "#1DA1F2",
                borderRadius: "16px",
                display: "flex",
                alignItems: "center",
                gap: "8px",
                boxShadow: "0 2px 8px rgba(29, 161, 242, 0.3)",
                transition: "all 0.3s ease",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = "#1991DB";
                e.currentTarget.style.transform = "translateY(-1px)";
                e.currentTarget.style.boxShadow =
                  "0 4px 12px rgba(29, 161, 242, 0.4)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = "#1DA1F2";
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow =
                  "0 2px 8px rgba(29, 161, 242, 0.3)";
              }}
            >
              <span
                style={{
                  fontSize: "16px",
                  filter: "drop-shadow(0 1px 2px rgba(0,0,0,0.1))",
                }}
              >
                ✈️
              </span>
              <span
                style={{
                  background: "linear-gradient(45deg, #ffffff, #f0f8ff)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                  fontWeight: "600",
                }}
              >
                Telegram
              </span>
            </Button>
          </div>

          {/* 右上角工具栏 */}
          <div
            style={{
              position: "absolute",
              top: "0",
              right: "0",
              display: "flex",
              alignItems: "center",
              gap: "8px",
              zIndex: 10,
            }}
          >
            <PriceIndicator />
            <Button
              type="text"
              size="small"
              icon={<FireOutlined />}
              onClick={() => setShowAlphaTokenSettings(true)}
              style={{
                fontSize: "12px",
                color: "#722ed1",
                padding: "0 8px",
                height: "24px",
              }}
            >
              Alpha
            </Button>
            <Button
              type="text"
              size="small"
              icon={<SettingOutlined />}
              onClick={() => setShowApiKeySettings(true)}
              style={{
                fontSize: "12px",
                color: "#999",
                padding: "0 8px",
                height: "24px",
              }}
            >
              API Key
            </Button>
          </div>

          <div style={{ textAlign: "center", marginBottom: "32px" }}>
            <Title level={2} style={{ marginBottom: "8px" }}>
              🚀 币安 Alpha 查询
            </Title>
            <Paragraph style={{ fontSize: "16px", color: "#666" }}>
              分析您的币安 Alpha 交易数据，计算 Alpha 分数
            </Paragraph>
            <Paragraph
              style={{ fontSize: "14px", color: "#999", marginTop: "16px" }}
            >
              永远记得汇丰银行的那句话,所有的出发都是为了更好的回来,希望你归来仍是少年!
            </Paragraph>
          </div>

          <Space direction="vertical" size="large" style={{ width: "100%" }}>
            <AddressInput
              onSearch={handleSearch}
              onBatchSearch={handleBatchSearch}
              loading={loading}
            />

            {loading && (
              <div style={{ textAlign: "center", padding: "40px" }}>
                <Spin
                  size="large"
                  indicator={<LoadingOutlined style={{ fontSize: 24 }} spin />}
                />
                <div
                  style={{ marginTop: "16px", fontSize: "16px", color: "#666" }}
                >
                  {loadingProgress || "正在查询中..."}
                </div>
                <div
                  style={{ marginTop: "8px", fontSize: "14px", color: "#999" }}
                >
                  正在通过 Etherscan v2 API 获取交易数据，请稍候...
                </div>
              </div>
            )}

            {!loading && dailySummary && (
              <>
                <SummaryCard
                  summary={dailySummary}
                  searchedAddress={
                    isBatchMode
                      ? `批量查询 (${searchedAddresses.length} 个地址)`
                      : searchedAddress
                  }
                />
                {isBatchMode ? (
                  <BatchResultTable batchResults={batchResults} />
                ) : (
                  <DexTransactionTable dexTransactions={dexTransactions} />
                )}
              </>
            )}
          </Space>

          {/* API Key 设置弹窗 */}
          <ApiKeySettings
            visible={showApiKeySettings}
            onClose={() => setShowApiKeySettings(false)}
          />

          {/* Alpha代币设置弹窗 */}
          <AlphaTokenSettings
            visible={showAlphaTokenSettings}
            onClose={() => setShowAlphaTokenSettings(false)}
          />
        </div>
      </Content>
    </Layout>
  );
}

export default App;
