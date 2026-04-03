import React from "react";
import Icon from "./icon/Icon";
import myComputerIcon from "../../assets/mycomputer.png";
import recycleBinIcon from "../../assets/recyclebin.png";

const IconList = ({
  desktopRef,
  positions,
  onPositionChange,
  onOpenWindow,
  onOpenPortfolioStudio,
  onOpenPortfolioViewer,
  onIconContextMenu,
}) => {
  return (
    <>
      <Icon
        id="myComputer"
        name="Mi PC"
        image={myComputerIcon}
        left={positions.myComputer.x}
        top={positions.myComputer.y}
        desktopRef={desktopRef}
        onPositionChange={onPositionChange}
        onOpen={() => onOpenWindow("myComputer")}
        onRequestContextMenu={onIconContextMenu}
      />
      <Icon
        id="recycleBin"
        name="Papelera"
        image={recycleBinIcon}
        left={positions.recycleBin.x}
        top={positions.recycleBin.y}
        desktopRef={desktopRef}
        onPositionChange={onPositionChange}
        onOpen={() => onOpenWindow("recycleBin")}
        onRequestContextMenu={onIconContextMenu}
      />
      <Icon
        id="portfolioViewer"
        name="Mi portfolio"
        image={myComputerIcon}
        left={positions.portfolioViewer?.x ?? 16}
        top={positions.portfolioViewer?.y ?? 328}
        desktopRef={desktopRef}
        onPositionChange={onPositionChange}
        onOpen={onOpenPortfolioViewer}
        onRequestContextMenu={onIconContextMenu}
      />
      <Icon
        id="portfolioStudio"
        name="Estudio del portfolio"
        image={myComputerIcon}
        left={positions.portfolioStudio?.x ?? 16}
        top={positions.portfolioStudio?.y ?? 224}
        desktopRef={desktopRef}
        onPositionChange={onPositionChange}
        onOpen={onOpenPortfolioStudio}
        onRequestContextMenu={onIconContextMenu}
      />
    </>
  );
};

export default IconList;
