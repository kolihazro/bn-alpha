import { useState } from "react";
import { Layout, Typography, Space, message, Spin, Button } from "antd";
import {
  LoadingOutlined,
  SettingOutlined,
  FireOutlined,
} from "@ant-design/icons";
import AddressInput from "./components/AddressInput";
import SummaryCard from "./components/SummaryCard";
import BatchResultTable from "./components/BatchResultTable";
import PriceIndicator from "./components/PriceIndicator";
import ApiKeySettings from "./components/ApiKeySettings";
import AlphaTokenSettings from "./components/AlphaTokenSettings";
import { getAllTransactions, DEFAULT_CHAIN_ID } from "./services/api";
import {
  processBatchAddresses,
  calculateBatchSummary,
} from "./utils/dataProcessor";
import type { DailySummary, AddressSummary } from "./types";
import { saveQueryState } from "./utils/queryStateManager";

const { Content } = Layout;
const { Title, Paragraph } = Typography;

function App() {
  const [loading, setLoading] = useState(false);
  const [dailySummary, setDailySummary] = useState<DailySummary | null>(null);
  const [loadingProgress, setLoadingProgress] = useState<string>("");

  // 批量查询相关状态
  const [batchResults, setBatchResults] = useState<AddressSummary[]>([]);
  const [searchedAddresses, setSearchedAddresses] = useState<string[]>([]);

  // API Key设置状态
  const [showApiKeySettings, setShowApiKeySettings] = useState(false);

  // Alpha代币设置状态
  const [showAlphaTokenSettings, setShowAlphaTokenSettings] = useState(false);

  // 批量查询处理函数
  const handleBatchSearch = async (
    addressItems: Array<{ address: string; label?: string }>
  ) => {
    setLoading(true);
    // 提取纯地址数组用于显示
    const addresses = addressItems.map((item) => item.address);
    setSearchedAddresses(addresses);
    setBatchResults([]);
    setDailySummary(null);

    // 保存查询状态
    saveQueryState("batch", addresses, addressItems);

    setLoadingProgress(`正在批量查询 ${addresses.length} 个地址...`);

    try {
      // 使用批量处理函数，带进度回调
      const results = await processBatchAddresses(
        addressItems.map((item) => ({
          address: item.address,
          label: item.label,
        })),
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
              onClick={() => window.open("https://x.com/0x_xiguajun", "_blank")}
              style={{
                fontSize: "12px",
                fontWeight: "500",
                padding: "0 12px",
                height: "36px",
                backgroundColor: "#1DA1F2",
                borderColor: "#1DA1F2",
                borderRadius: "18px",
                display: "flex",
                alignItems: "center",
                gap: "6px",
                boxShadow: "0 2px 8px rgba(29, 161, 242, 0.3)",
                transition: "all 0.3s ease",
                minWidth: "160px",
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
              <img
                src="https://youke1.picui.cn/s1/2025/07/20/687c685e130ed.jpg"
                alt="Profile"
                style={{
                  width: "20px",
                  height: "20px",
                  borderRadius: "50%",
                  objectFit: "cover",
                }}
              />
              <span
                style={{
                  background: "linear-gradient(45deg, #ffffff, #f0f8ff)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                  fontWeight: "600",
                }}
              >
                联系Telegram
              </span>
              <span
                style={{ fontSize: "11px", opacity: 0.8, color: "#ffffff" }}
              >
                @winter_k
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
              永远记得汇丰银行的那句话:所有的出发都是为了更好的回来,希望你归来仍是少年!
            </Paragraph>
          </div>

          <Space direction="vertical" size="large" style={{ width: "100%" }}>
            <AddressInput onBatchSearch={handleBatchSearch} loading={loading} />

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
                  searchedAddresses={searchedAddresses}
                />
                <BatchResultTable batchResults={batchResults} />
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
